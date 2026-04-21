#import "RNLottieSplash.h"

@implementation RNLottieSplash

RCT_EXPORT_MODULE()

/**
 * Called by the JS layer as soon as the React component mounts, signalling
 * that our Lottie overlay has taken over from the LaunchScreen.
 *
 * On iOS the LaunchScreen is dismissed automatically when the first React
 * Native view appears. Since <LottieSplashScreen> renders immediately on top
 * of the app content, the transition is seamless — this method is provided
 * for API parity with Android and future extensibility.
 */
#ifdef RCT_NEW_ARCH_ENABLED
- (void)hide:(double)duration
     resolve:(RCTPromiseResolveBlock)resolve
      reject:(RCTPromiseRejectBlock)reject
{
  dispatch_async(dispatch_get_main_queue(), ^{
    resolve(nil);
  });
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeRNLottieSplashSpecJSI>(params);
}

#else

RCT_EXPORT_METHOD(hide:(double)duration
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    resolve(nil);
  });
}

#endif

@end
