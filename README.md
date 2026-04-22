# react-native-lottie-splash

[![npm version](https://img.shields.io/npm/v/@rick427/react-native-lottie-splash.svg?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@rick427/react-native-lottie-splash)
[![npm downloads](https://img.shields.io/npm/dm/@rick427/react-native-lottie-splash.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@rick427/react-native-lottie-splash)
[![license](https://img.shields.io/npm/l/@rick427/react-native-lottie-splash.svg?style=flat-square&color=blue)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/rick427/react-native-lottie-splash?style=flat-square&logo=github&color=yellow)](https://github.com/rick427/react-native-lottie-splash/stargazers)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.71+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![New Architecture](https://img.shields.io/badge/New%20Architecture-Ready-4CAF50?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev/architecture/landing-page)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9-7F52FF?style=flat-square&logo=kotlin&logoColor=white)](https://kotlinlang.org/)
[![Swift/ObjC](https://img.shields.io/badge/Objective--C++-iOS-A9B4C2?style=flat-square&logo=apple&logoColor=white)](https://developer.apple.com/)
[![Lottie](https://img.shields.io/badge/Lottie-6.0+-00DDB3?style=flat-square&logo=lottiefiles&logoColor=white)](https://github.com/lottie-react-native/lottie-react-native)

[![iOS](https://img.shields.io/badge/iOS-13.4+-000000?style=flat-square&logo=apple&logoColor=white)](#)
[![Android](https://img.shields.io/badge/Android-24+-3DDC84?style=flat-square&logo=android&logoColor=white)](#)

---

Animated Lottie splash screen for React Native. Plays a Lottie animation on app launch, then dismisses once your app signals it's ready — with a smooth fade-out transition.

Works on **Android** and **iOS**, supports the **New Architecture** (RN 0.73+).

---

## How it works

```
┌──────────────────────────────────────────────────────────────┐
│ 1.  App launch                                               │
│     OS shows the native window background (solid color)      │
├──────────────────────────────────────────────────────────────┤
│ 2.  JS bundle loads → React renders                          │
│     <LottieSplashScreen> mounts on top of your app,          │
│     covering the entire screen and blocking touches          │
├──────────────────────────────────────────────────────────────┤
│ 3.  Lottie animation plays                                   │
│     Hardware-accelerated, non-looping                        │
├──────────────────────────────────────────────────────────────┤
│ 4.  Dismiss  (one of)                                        │
│       autoHide={true}   → fades out when animation ends      │
│       LottieSplash.hide() → fades out whenever you call it   │
├──────────────────────────────────────────────────────────────┤
│ 5.  Overlay fades to opacity 0 and unmounts                  │
│     App is fully visible and interactive                     │
└──────────────────────────────────────────────────────────────┘
```

> **Pair with `react-native-bootsplash`** for a fully flash-free launch — see the [recipe below](#recipe-bootsplash--lottie-splash-recommended-setup).

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
npm install @rick427/react-native-lottie-splash
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
import { LottieSplashScreen } from '@rick427/react-native-lottie-splash';
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
import { hide as hideSplash } from '@rick427/react-native-lottie-splash';

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

### Sizing the Lottie animation

By default the animation is rendered edge-to-edge (`fullscreen={true}`). To constrain the animation to a specific size while keeping `backgroundColor` filling the whole screen, set `fullscreen={false}` and provide `width`/`height`:

```tsx
// 80% of screen (the default sizes when fullscreen={false}):
<LottieSplashScreen
  source={require('./assets/splash.json')}
  backgroundColor="#e46921"
  fullscreen={false}
>
  <Navigator />
</LottieSplashScreen>

// Fixed pixel dimensions:
<LottieSplashScreen
  source={require('./assets/splash.json')}
  backgroundColor="#e46921"
  fullscreen={false}
  width={240}
  height={240}
>
  <Navigator />
</LottieSplashScreen>

// Percentage values:
<LottieSplashScreen
  source={require('./assets/splash.json')}
  backgroundColor="#e46921"
  fullscreen={false}
  width="60%"
  height="40%"
>
  <Navigator />
</LottieSplashScreen>
```

Good rule of thumb for `resizeMode` when sizing manually:
- **`contain`** (default) — preserves aspect ratio within the given bounds (may letterbox)
- **`cover`** — fills the given bounds, may crop the animation
- **`center`** — rendered at the animation's natural size inside the bounds

### Status bar control

By default the splash renders a **transparent, translucent** status bar with dark icons (so the splash background extends behind the clock/battery icons). Override via:

```tsx
<LottieSplashScreen
  source={require('./assets/splash.json')}
  backgroundColor="#001122"        // dark background
  statusBarStyle="light-content"   // light icons for a dark splash
>
  <Navigator />
</LottieSplashScreen>
```

The status bar declaration unmounts with the overlay, so whatever your underlying screen declares takes over cleanly when the splash dismisses.

---

## Props

| Prop                    | Type                                         | Default          | Description |
|-------------------------|----------------------------------------------|------------------|-------------|
| `source`                | `object \| string \| { uri }`               | **required**     | Lottie animation source — use `require('./anim.json')` or `{ uri: '...' }` |
| `backgroundColor`       | `string`                                     | `'#FFFFFF'`      | Splash overlay background color (always fills full screen) |
| `resizeMode`            | `'cover' \| 'contain' \| 'center'`          | `'contain'`      | How the animation is sized within its bounds |
| `fullscreen`            | `boolean`                                    | `true`           | When `true`, the animation fills the screen edge-to-edge. When `false`, the animation uses `width`/`height` and is centered |
| `width`                 | `number \| \`${number}%\``                   | `'80%'`          | Animation width when `fullscreen={false}`. Number is dp, string is a percentage |
| `height`                | `number \| \`${number}%\``                   | `'80%'`          | Animation height when `fullscreen={false}` |
| `autoHide`              | `boolean`                                    | `false`          | Automatically dismiss when the animation finishes |
| `fadeDuration`          | `number`                                     | `400`            | Duration of the fade-out in milliseconds |
| `speed`                 | `number`                                     | `1`              | Playback speed multiplier |
| `statusBarStyle`        | `'default' \| 'dark-content' \| 'light-content'` | `'dark-content'` | Status bar icon color while the splash is visible |
| `statusBarTranslucent`  | `boolean`                                    | `true`           | (Android only) Whether the status bar is translucent so the splash background bleeds behind it |
| `onHide`                | `() => void`                                 | —                | Called after the overlay fully fades out |
| `children`              | `ReactNode`                                  | **required**     | Your app content (rendered behind the splash) |

---

## Imperative API

```ts
import { hide } from '@rick427/react-native-lottie-splash';

hide(options?: { fadeDuration?: number }): void
```

- Safe to call **before** the component mounts — the hide is queued.
- Calling it multiple times is safe — only the first call has effect.

---

## Recipe: bootsplash + Lottie splash (recommended setup)

This is the production setup for a **flash-free** launch: `react-native-bootsplash` handles the instant static splash before JS loads, then hands off seamlessly to your Lottie animation.

```
App launch
  │
  ├─ [native] window background color        ← set in styles.xml
  ├─ [native] bootsplash static image        ← shows immediately, before JS
  │
  ├─ JS bundle loads → React renders
  ├─ <LottieSplashScreen> mounts (covers the screen, still hidden behind bootsplash)
  │
  ├─ double-rAF → BootSplash.hide()          ← seamless handoff
  ├─ Lottie animation plays
  └─ autoHide → overlay fades out → app visible
```

### Step 1 — Install both libraries

```sh
npm install react-native-bootsplash @rick427/react-native-lottie-splash lottie-react-native
cd ios && pod install && cd ..
```

Generate the bootsplash assets per the [bootsplash docs](https://github.com/zoontek/react-native-bootsplash#usage) (`npx react-native generate-bootsplash ...`).

### Step 2 — Match background colors everywhere

**Critical:** the following four values must all be the **same hex color** (ideally matching the first frame of your Lottie animation) — otherwise you'll see color pops during the handoff:

| Where | What |
|-------|------|
| `android/app/src/main/res/values/colors.xml` | `bootsplash_background` |
| `android/app/src/main/res/values/styles.xml` | `android:windowBackground` and `android:windowSplashScreenBackground` |
| `ios/<YourApp>/LaunchScreen.storyboard` | Root view background color (set in Xcode's Attributes Inspector) |
| `<LottieSplashScreen backgroundColor="..." />` | The prop value |

**`android/app/src/main/res/values/colors.xml`**
```xml
<resources>
  <color name="bootsplash_background">#e46921</color>
</resources>
```

**`android/app/src/main/res/values/styles.xml`** — inside your `AppTheme`:
```xml
<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
  <!-- your existing items... -->
  <item name="android:windowBackground">@color/bootsplash_background</item>
  <item name="android:windowSplashScreenBackground">@color/bootsplash_background</item>
</style>
```

> Without setting `android:windowBackground`, you'll get a white flash between bootsplash dismissing and the Lottie overlay painting, because Android's default window background is white.

### Step 3 — Wire it up in `App.tsx`

```tsx
import BootSplash from 'react-native-bootsplash';
import { LottieSplashScreen } from '@rick427/react-native-lottie-splash';

export default function App() {
  useSplashScreen(); // defined below

  return (
    <LottieSplashScreen
      source={require('./assets/splash.json')}
      backgroundColor="#e46921"  // MUST match bootsplash_background
      autoHide={true}            // dismiss when animation finishes
      fadeDuration={400}
    >
      <RootNavigator />
    </LottieSplashScreen>
  );
}
```

### Step 4 — Dismiss bootsplash after the Lottie overlay has painted

Create a `useSplashScreen` hook that waits for the Lottie overlay to actually hit the screen before telling bootsplash to go away. A **double `requestAnimationFrame`** is the reliable pattern — the first RAF fires before React's commit has flushed, the second guarantees you're past paint:

```ts
// hooks/useSplashScreen.ts
import { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';

export default function useSplashScreen() {
  useEffect(() => {
    // Wait two frames so the <LottieSplashScreen> overlay is definitely
    // painted before bootsplash dismisses — avoids any flash in between.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        BootSplash.hide({ fade: false });
      });
    });
  }, []);
}
```

> Use `fade: false`, not `fade: true`. The Lottie animation itself is your visual transition — a simultaneous bootsplash fade competes with it and looks messy.

### Step 5 — (Optional) Wrap app init into the same hook

If you have work to do before the app is interactive (fetching config, checking auth, etc.), do it before dismissing bootsplash and use `autoHide={false}` on the splash so you control exactly when the Lottie dismisses:

```ts
// hooks/useSplashScreen.ts
import { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';
import { hide as hideLottie } from '@rick427/react-native-lottie-splash';

export default function useSplashScreen() {
  useEffect(() => {
    const init = async () => {
      // await hydrateStore();
      // await checkAuth();
    };

    init().finally(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          BootSplash.hide({ fade: false });
        });
      });
      // When app is ready, dismiss the Lottie overlay too:
      hideLottie({ fadeDuration: 400 });
    });
  }, []);
}
```

### Step 6 — Clean build

Theme changes are cached aggressively by Android. After editing `styles.xml`:

```sh
cd android && ./gradlew clean && cd ..
npx react-native run-android
# or
cd ios && xcodebuild clean && cd ..
npx react-native run-ios
```

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| White flash between bootsplash and Lottie | Set `android:windowBackground` in `styles.xml` (Step 2) |
| Color pop during handoff | All four background colors must match exactly (Step 2) |
| Second white flash after Lottie dismisses | Upgrade to the latest version of this library (the tree-stability fix in v1.0.1+) |
| Laggy Lottie playback | Already handled — the library sets `renderMode="HARDWARE"` and `cacheComposition` internally |
| Bootsplash hides before Lottie ready | Use the double `requestAnimationFrame` pattern in Step 4 |

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

## Authors

- **Richard Njoku** — [@rick427](https://github.com/rick427)

---

## License

[MIT](./LICENSE) © Richard Njoku
