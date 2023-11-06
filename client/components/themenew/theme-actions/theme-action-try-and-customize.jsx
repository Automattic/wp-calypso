import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch, useSelector } from 'calypso/state';
import { tryAndCustomize } from 'calypso/state/themes/actions';
import {
	getIsLivePreviewSupported,
	shouldShowTryAndCustomize,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';

export default function ThemeActionTryAndCustomize() {
	const { themeId } = useThemeContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isLivePreviewSupported = useSelector( ( state ) =>
		getIsLivePreviewSupported( state, themeId, siteId )
	);
	const isTryAndCustomizeEnabled = useSelector( ( state ) =>
		shouldShowTryAndCustomize( state, themeId, siteId )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	const dispatch = useDispatch();

	if ( ! siteId || isLivePreviewSupported || ! isTryAndCustomizeEnabled ) {
		return null;
	}

	const onClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'tryandcustomize' } );
		dispatch( tryAndCustomize( themeId, siteId ) );
	};

	return <PopoverMenuItem onClick={ onClick }>{ translate( 'Try & Customize' ) }</PopoverMenuItem>;
}
