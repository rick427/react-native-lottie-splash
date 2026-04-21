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
npm install react-native-bootsplash react-native-lottie-splash lottie-react-native
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
import { LottieSplashScreen } from 'react-native-lottie-splash';

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
import { hide as hideLottie } from 'react-native-lottie-splash';

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

## License

MIT
