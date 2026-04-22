import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { DimensionValue } from 'react-native';
import { Animated, Platform, StatusBar, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import NativeRNLottieSplash from './NativeRNLottieSplash';

export type AnimationSource = string | { uri: string } | object;

export interface LottieSplashScreenProps {
  /** Lottie animation — use require('./splash.json') or a remote { uri } */
  source: AnimationSource;
  /** Background color of the splash overlay. Should match your app's launch screen background. Default: '#FFFFFF' */
  backgroundColor?: string;
  /**
   * How the Lottie animation is sized within the screen.
   * - `contain` (default): entire animation visible, preserves aspect ratio
   * - `cover`: fills the view, may crop the animation
   * - `center`: rendered at its natural size, centered
   */
  resizeMode?: 'cover' | 'contain' | 'center';
  /** Automatically dismiss when the animation finishes (loop must be false). Default: false */
  autoHide?: boolean;
  /**
   * Gate for `autoHide`. When `autoHide={true}`, the splash only dismisses
   * once BOTH the animation has finished AND `ready` is `true`.
   *
   * Use this to hold the splash on its last frame while async work (OTA
   * checks, auth bootstrap, remote config, etc.) is still in flight.
   *
   * - `ready === true` (default): behaves like before — hides as soon as the
   *   animation ends.
   * - `ready === false`: animation plays, holds on the last frame, and
   *   dismisses once `ready` flips to `true`.
   *
   * Ignored when `autoHide={false}` — use the imperative `hide()` API instead.
   *
   * Default: `true`
   */
  ready?: boolean;
  /** Duration of the fade-out transition in milliseconds. Default: 400 */
  fadeDuration?: number;
  /** Playback speed multiplier. Default: 1 */
  speed?: number;
  /**
   * Status bar content color while the splash is visible. Use `dark-content`
   * for dark icons on a light background, `light-content` for light icons on
   * a dark background. Default: `dark-content`.
   */
  statusBarStyle?: 'default' | 'dark-content' | 'light-content';
  /**
   * (Android only) Whether the status bar should be translucent so the
   * splash background shows through. Default: `true`.
   */
  statusBarTranslucent?: boolean;
  /**
   * Whether the Lottie animation fills the entire screen (edge-to-edge).
   * When `false`, the animation is sized by `width`/`height` and centered
   * against `backgroundColor`. Default: `true`.
   */
  fullscreen?: boolean;
  /**
   * Width of the Lottie animation when `fullscreen={false}`. Accepts a number
   * (dp) or percentage string (e.g. `'80%'`). Default: `'80%'`.
   */
  width?: DimensionValue;
  /**
   * Height of the Lottie animation when `fullscreen={false}`. Accepts a number
   * (dp) or percentage string (e.g. `'80%'`). Default: `'80%'`.
   */
  height?: DimensionValue;
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
  ready = true,
  fadeDuration = 400,
  speed = 1,
  statusBarStyle = 'dark-content',
  statusBarTranslucent = true,
  fullscreen = true,
  width = '80%',
  height = '80%',
  onHide,
  children,
}: LottieSplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [animationFinished, setAnimationFinished] = useState(false);
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

  // autoHide logic: dismiss once both the animation has finished AND the
  // consumer says we're ready. When `ready` is omitted it defaults to `true`,
  // so this reduces to "hide on animation end" — backward compatible.
  useEffect(() => {
    if (autoHide && animationFinished && ready) {
      doHide();
    }
  }, [autoHide, animationFinished, ready, doHide]);

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
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor, opacity },
            // Center the Lottie inside the full-screen background when it's
            // not edge-to-edge. For fullscreen=true we keep the original
            // flex layout so the animation fills its parent 1:1.
            !fullscreen && styles.centered,
          ]}
        >
          {/*
           * Transparent, translucent status bar while the splash is shown so
           * the splash background bleeds behind the clock/battery icons
           * instead of a solid gray bar sitting at the top. When `visible`
           * flips to false this <StatusBar> unmounts and React Native
           * restores whatever the underlying screen declares.
           */}
          <StatusBar
            barStyle={statusBarStyle}
            backgroundColor="transparent"
            translucent={Platform.OS === 'android' ? statusBarTranslucent : undefined}
            animated
          />
          <LottieView
            ref={lottieRef}
            source={source as Parameters<typeof LottieView>[0]['source']}
            autoPlay
            loop={false}
            speed={speed}
            style={fullscreen ? styles.lottieFull : { width, height }}
            resizeMode={resizeMode}
            // Hardware rendering removes most of the lag on complex animations.
            renderMode="HARDWARE"
            cacheComposition
            onAnimationFinish={(isCancelled: boolean) => {
              if (!isCancelled) {
                setAnimationFinished(true);
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
  lottieFull: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
