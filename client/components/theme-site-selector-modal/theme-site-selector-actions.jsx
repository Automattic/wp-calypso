import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { activate } from 'calypso/state/themes/actions';
import { useIsThemeAllowedOnSite } from 'calypso/state/themes/hooks/use-is-theme-allowed-on-site';
//import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';
import { isThemeActive } from 'calypso/state/themes/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';

export default function ThemeSiteSelectorActions( { siteId, themeId } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	//const themeTier = useThemeTierForTheme( siteId, themeId );
	const isThemeAllowed = useIsThemeAllowedOnSite( siteId, themeId );

	const actions = {
		activate: {
			label: translate( 'Activate this theme' ),
			onClick: () => dispatch( activate( themeId, siteId, 'showcase' ) ),
		},
	};

	let action;

	if ( isThemeAllowed ) {
		action = actions.activate;
	}

	const onClick = () => {
		dispatch( setSelectedSiteId( siteId ) );
		action.onClick();
	};

	return (
		<div className="theme-site-selector-modal__actions">
			<Button
				disabled={ ! siteId || ! isThemeAllowed || isThemeActive }
				isPrimary
				onClick={ onClick }
			>
				{ action.label }
			</Button>
		</div>
	);
}
