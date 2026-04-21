import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Signals the native layer that the React overlay has taken over from the
   * OS splash screen. `duration` is reserved for future native-side fade
   * animations; pass 0 for an immediate hand-off.
   */
  hide(duration: number): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('RNLottieSplash');
