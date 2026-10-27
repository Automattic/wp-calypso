import { useSelector } from 'react-redux';
import getLayoutStyle from '../panel/state/selectors/get-layout-style';
import { useAppContext } from './context';

export const useIsSimplifiedNote = (): boolean => {
	const { isSimplifiedNoteEnabled, isViewSettingsEnabled } = useAppContext();
	const layoutStyle = useSelector( getLayoutStyle );

	return isSimplifiedNoteEnabled && isViewSettingsEnabled && layoutStyle === 'simplified';
};
