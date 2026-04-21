package com.rnlottiesplash

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class RNLottieSplashPackage : TurboReactPackage() {
  override fun getModule(
    name: String,
    reactContext: ReactApplicationContext,
  ): NativeModule? =
    if (name == RNLottieSplashModule.NAME) RNLottieSplashModule(reactContext) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
    ReactModuleInfoProvider {
      mapOf(
        RNLottieSplashModule.NAME to ReactModuleInfo(
          RNLottieSplashModule.NAME,
          RNLottieSplashModule.NAME,
          /* canOverrideExistingModule = */ false,
          /* needsEagerInit = */ false,
          /* isCxxModule = */ false,
          /* isTurboModule = */ BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
        ),
      )
    }
}
