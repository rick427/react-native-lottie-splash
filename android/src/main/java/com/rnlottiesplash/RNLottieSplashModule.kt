package com.rnlottiesplash

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RNLottieSplashModule.NAME)
class RNLottieSplashModule(reactContext: ReactApplicationContext) :
  NativeRNLottieSplashSpec(reactContext) {

  override fun getName(): String = NAME

  /**
   * Called by the JS layer as soon as the React component mounts, signalling
   * that our Lottie overlay has taken over from the OS splash screen.
   *
   * On Android the OS splash screen is dismissed automatically when the first
   * React Native frame is rendered — by that point our <LottieSplashScreen>
   * overlay is already visible, so this method is a no-op used for API parity
   * with iOS and to allow future native-side work (e.g. exit-animation hooks).
   */
  override fun hide(duration: Double, promise: Promise) {
    val activity = currentActivity
    if (activity == null) {
      promise.reject("ERR_ACTIVITY_NULL", "Current activity is null")
      return
    }
    activity.runOnUiThread {
      promise.resolve(null)
    }
  }

  companion object {
    const val NAME = "RNLottieSplash"
  }
}
