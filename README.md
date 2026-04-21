# react-native-lottie-splash

Animated Lottie splash screen for React Native. Plays a Lottie animation on app launch, then dismisses once your app signals it's ready — with a smooth fade-out transition.

Works on **Android** and **iOS**, supports the **New Architecture** (RN 0.73+).

---

## How it works

```
App launch
    │
    ▼
OS shows native splash (static background)
    │
    ▼  ← JS bundle loads
React renders <LottieSplashScreen>  ──────────────────────────────────┐
    │  (covers entire screen, blocks touches)                          │
    ▼                                                                  │
Lottie animation plays                                                 │
    │                                                                  │
    ├─ autoHide={true}  → fade out when animation finishes             │
    └─ autoHide={false} → call LottieSplash.hide() when app is ready  │
                                                                       │
Overlay fades out ─────────────────────────────────────────────────────┘
    │
    ▼
App is fully interactive
```

---

## Requirements

| Peer dependency     | Version  |
|---------------------|----------|
| `react-native`      | ≥ 0.71   |
| `react`             | ≥ 18     |
| `lottie-react-native` | ≥ 6.0  |

---

## Installation

```sh
npm install react-native-lottie-splash
# lottie-react-native is a peer dep — install it if you haven't already
npm install lottie-react-native
```

### iOS

```sh
cd ios && pod install
```

### Android

No extra steps — the package auto-links via React Native's auto-linking.

---

## Native splash background setup

To avoid a white flash between the OS splash screen and your Lottie animation, set the native splash background to match the **first frame** of your animation.

### Android

**`android/app/src/main/res/values/colors.xml`**
```xml
<resources>
  <color name="lottie_splash_bg">#001122</color>
</resources>
```

**`android/app/src/main/res/values/styles.xml`** — add to your `AppTheme`:
```xml
<!-- Shown while the JS bundle loads (API < 31) -->
<item name="android:windowBackground">@color/lottie_splash_bg</item>
<!-- Android 12+ system splash screen background -->
<item name="android:windowSplashScreenBackground">@color/lottie_splash_bg</item>
```

### iOS

Open `LaunchScreen.storyboard` in Xcode and set the background color of the root view to match your animation's first frame color.

---

## Usage

### Wrap your app

```tsx
// App.tsx
import React from 'react';
import { LottieSplashScreen } from 'react-native-lottie-splash';
import { Navigator } from './src/navigation';

export default function App() {
  return (
    <LottieSplashScreen
      source={require('./assets/splash.json')}
      backgroundColor="#001122"
      resizeMode="contain"
      autoHide={false}         // we'll call hide() manually
      fadeDuration={500}
    >
      <Navigator />
    </LottieSplashScreen>
  );
}
```

### Dismiss manually when the app is ready

```tsx
// Anywhere in your app — no need to pass refs or use context
import { hide as hideSplash } from 'react-native-lottie-splash';

function RootNavigator() {
  const { isReady } = useAppInitialization();

  useEffect(() => {
    if (isReady) {
      hideSplash();           // fades out with the configured fadeDuration
      // or: hideSplash({ fadeDuration: 300 });  to override per-call
    }
  }, [isReady]);

  return <Stack.Navigator />;
}
```

### Auto-dismiss when animation finishes

```tsx
<LottieSplashScreen
  source={require('./assets/splash.json')}
  backgroundColor="#001122"
  autoHide={true}   // hide() is called automatically when animation ends
  fadeDuration={400}
>
  <Navigator />
</LottieSplashScreen>
```

---

## Props

| Prop              | Type                              | Default       | Description |
|-------------------|-----------------------------------|---------------|-------------|
| `source`          | `object \| string \| { uri }`    | **required**  | Lottie animation source — use `require('./anim.json')` or `{ uri: '...' }` |
| `backgroundColor` | `string`                         | `'#FFFFFF'`   | Splash overlay background color |
| `resizeMode`      | `'cover' \| 'contain' \| 'center'` | `'contain'` | How the animation is sized on screen |
| `autoHide`        | `boolean`                        | `false`       | Automatically dismiss when the animation finishes |
| `fadeDuration`    | `number`                         | `400`         | Duration of the fade-out in milliseconds |
| `speed`           | `number`                         | `1`           | Playback speed multiplier |
| `onHide`          | `() => void`                     | —             | Called after the overlay fully fades out |
| `children`        | `ReactNode`                      | **required**  | Your app content (rendered behind the splash) |

---

## Imperative API

```ts
import { hide } from 'react-native-lottie-splash';

hide(options?: { fadeDuration?: number }): void
```

- Safe to call **before** the component mounts — the hide is queued.
- Calling it multiple times is safe — only the first call has effect.

---

## With react-native-bootsplash

If you already use `react-native-bootsplash` for the static launch screen, you can use both libraries together:

```tsx
import BootSplash from 'react-native-bootsplash';
import { LottieSplashScreen, hide as hideLottieSplash } from 'react-native-lottie-splash';

export default function App() {
  return (
    <LottieSplashScreen
      source={require('./assets/splash.json')}
      backgroundColor="#001122"
      autoHide={false}
    >
      <Navigator />
    </LottieSplashScreen>
  );
}

// In your root navigator / init hook:
useEffect(() => {
  // 1. Dismiss the static bootsplash — our Lottie overlay is already visible
  BootSplash.hide({ fade: false });

  // 2. When the app is ready, dismiss the Lottie overlay
  initializeApp().then(() => hideLottieSplash());
}, []);
```

---

## Registering the Android package

React Native's auto-linking handles this automatically for RN 0.60+. If you are on an older version or auto-linking is disabled, add the package manually:

**`android/app/src/main/java/.../MainApplication.kt`**
```kotlin
import com.rnlottiesplash.RNLottieSplashPackage

override fun getPackages(): List<ReactPackage> =
  PackageList(this).packages.apply {
    add(RNLottieSplashPackage())
  }
```

---

## License

MIT
