import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import NativeRNLottieSplash from './NativeRNLottieSplash';

export type AnimationSource = string | { uri: string } | object;

export interface LottieSplashScreenProps {
  /** Lottie animation — use require('./splash.json') or a remote { uri } */
  source: AnimationSource;
  /** Background color of the splash overlay. Should match your app's launch screen background. Default: '#FFFFFF' */
  backgroundColor?: string;
  /** How the animation is sized within the screen. Default: 'contain' */
  resizeMode?: 'cover' | 'contain' | 'center';
  /** Automatically dismiss when the animation finishes (loop must be false). Default: false */
  autoHide?: boolean;
  /** Duration of the fade-out transition in milliseconds. Default: 400 */
  fadeDuration?: number;
  /** Playback speed multiplier. Default: 1 */
  speed?: number;
  /** Called after the splash has fully faded out */
  onHide?: () => void;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Imperative API — allows hide() to be called from anywhere (e.g. after your
// app finishes loading data) without needing a ref or context.
// ---------------------------------------------------------------------------

let _hide: ((fadeDuration?: number) => void) | null = null;
let _pendingHide: number | null = null;

/**
 * Imperatively dismiss the splash screen.
 *
 * Safe to call before the component mounts — the hide will be queued and
 * executed as soon as the <LottieSplashScreen> first renders.
 *
 * @example
 * // In your root component, once data is ready:
 * LottieSplash.hide();
 *
 * // Custom fade duration:
 * LottieSplash.hide({ fadeDuration: 600 });
 */
export function hide(options?: { fadeDuration?: number }): void {
  const duration = options?.fadeDuration;
  if (_hide) {
    _hide(duration);
  } else {
    // Queue the hide — executed once the component mounts
    _pendingHide = duration ?? -1; // -1 = "use component default"
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LottieSplashScreen({
  source,
  backgroundColor = '#FFFFFF',
  resizeMode = 'contain',
  autoHide = false,
  fadeDuration = 400,
  speed = 1,
  onHide,
  children,
}: LottieSplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);
  const isHiding = useRef(false);

  const doHide = useCallback(
    (customFadeDuration?: number) => {
      if (isHiding.current) return;
      isHiding.current = true;

      const duration = customFadeDuration != null && customFadeDuration >= 0
        ? customFadeDuration
        : fadeDuration;

      if (duration === 0) {
        setVisible(false);
        onHide?.();
        return;
      }

      Animated.timing(opacity, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setVisible(false);
          onHide?.();
        }
      });
    },
    [fadeDuration, opacity, onHide],
  );

  useEffect(() => {
    // Tell the native layer our overlay is now covering the screen so it can
    // release any OS-level splash hold (no-op on Android 12+ and iOS since
    // the system handles this automatically, but required for completeness).
    NativeRNLottieSplash?.hide(0).catch(() => {});

    // Register the imperative hide callback
    _hide = doHide;

    // Execute any queued hide() call that arrived before we mounted
    if (_pendingHide !== null) {
      const pending = _pendingHide;
      _pendingHide = null;
      doHide(pending === -1 ? undefined : pending);
    }

    return () => {
      _hide = null;
    };
  }, [doHide]);

  // IMPORTANT: We always render the same tree structure (root View wrapping
  // children) regardless of whether the overlay is visible. Conditionally
  // changing the parent type (e.g. View → Fragment) causes React to unmount
  // and remount {children} — which means your entire navigation tree gets
  // torn down and rebuilt, causing a white flash + loss of state.
  return (
    <View style={styles.root}>
      {children}
      {visible && (
        <Animated.View
          style={[StyleSheet.absoluteFillObject, { backgroundColor, opacity }]}
        >
          <LottieView
            ref={lottieRef}
            source={source as Parameters<typeof LottieView>[0]['source']}
            autoPlay
            loop={false}
            speed={speed}
            style={styles.lottie}
            resizeMode={resizeMode}
            // Hardware rendering removes most of the lag on complex animations.
            renderMode="HARDWARE"
            cacheComposition
            onAnimationFinish={(isCancelled: boolean) => {
              if (!isCancelled && autoHide) {
                doHide();
              }
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  lottie: {
    flex: 1,
  },
});
