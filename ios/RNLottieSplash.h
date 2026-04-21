#ifdef RCT_NEW_ARCH_ENABLED
#import <RNLottieSplashSpec/RNLottieSplashSpec.h>
@interface RNLottieSplash : NSObject <NativeRNLottieSplashSpec>
#else
#import <React/RCTBridgeModule.h>
@interface RNLottieSplash : NSObject <RCTBridgeModule>
#endif

@end
