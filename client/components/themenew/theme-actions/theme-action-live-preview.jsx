import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch, useSelector } from 'calypso/state';
import { livePreview } from 'calypso/state/themes/actions';
import { getIsLivePreviewSupported } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeShowcaseTracks from '../hooks/use-theme-showcase-tracks';
import { useThemeContext } from '../theme-context';

export default function ThemeActionLivePreview() {
	const { themeId } = useThemeContext();

	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const isLivePreviewSupported = useSelector( ( state ) =>
		getIsLivePreviewSupported( state, themeId, siteId )
	);

	const { recordThemeClick } = useThemeShowcaseTracks();

	const dispatch = useDispatch();

	if ( ! isLivePreviewSupported ) {
		return null;
	}

	const onClick = () => {
		dispatch( livePreview( themeId, siteId, 'list' ) );
		recordThemeClick( 'calypso_themeshowcase_theme_click', { action: 'live_preview' } );
	};

	return (
		<PopoverMenuItem onClick={ onClick }>
			{ translate( 'Preview & Customize', {
				comment: 'label for previewing a block theme',
			} ) }
		</PopoverMenuItem>
	);
}
