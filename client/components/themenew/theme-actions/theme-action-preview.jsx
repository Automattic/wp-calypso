import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch, useSelector } from 'calypso/state';
import { showThemePreview } from 'calypso/state/themes/actions';
import {
	getIsLivePreviewSupported,
	getThemeDemoUrl,
	isExternallyManagedTheme,
	isWpcomTheme,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';

export default function ThemeActionPreview() {
	const { themeId } = useThemeContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isExternallyManaged = useSelector( ( state ) =>
		isExternallyManagedTheme( state, themeId )
	);
	const isLivePreviewSupported = useSelector( ( state ) =>
		getIsLivePreviewSupported( state, themeId, siteId )
	);
	const isWpcom = useSelector( ( state ) => isWpcomTheme( state, themeId ) );
	const demoUrl = useSelector( ( state ) => getThemeDemoUrl( state, themeId, siteId ) );

	const { recordThemeClick } = useThemeShowcaseTracks();

	const dispatch = useDispatch();

	if ( isLivePreviewSupported || ! demoUrl ) {
		return null;
	}

	const onClick = () => {
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'preview' } );

		if ( isWpcom && ! isExternallyManaged ) {
			return dispatch( showThemePreview( themeId, siteId ) );
		}
		return window.open( demoUrl, '_blank', 'noreferrer,noopener' );
	};

	return (
		<PopoverMenuItem onClick={ onClick }>
			{ translate( 'Demo site', { comment: 'label for previewing the theme demo website' } ) }
		</PopoverMenuItem>
	);
}
