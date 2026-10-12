import { useSelector } from 'react-redux';
import getLayoutStyle from '../panel/state/selectors/get-layout-style';
import { useAppContext } from './context';

/** Whether the open note uses the simplified layout. */
export const useIsSimplifiedNote = (): boolean => {
	const { isViewSettingsEnabled } = useAppContext();
	const layoutStyle = useSelector( getLayoutStyle );

	return isViewSettingsEnabled && layoutStyle === 'simplified';
};
