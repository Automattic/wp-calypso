import { useAppContext } from './context';

/**
 * Returns whether the panel shows the simplified note layout, which follows the view settings flag.
 */
export const useIsSimplifiedNote = (): boolean => useAppContext().isViewSettingsEnabled;
