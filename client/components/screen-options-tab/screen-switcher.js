import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/route';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

export const DEFAULT_VIEW = 'default';
export const CLASSIC_VIEW = 'classic';

const ScreenSwitcher = ( { onSwitch, wpAdminPath } ) => {
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId );
	const wpAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId, wpAdminPath ) );

	// We indicate that the WP Admin view is preferred with the `preferred-view` query param. WP Admin will
	// use that param to store the preference, so next times the user visits the page via the sidebar menu
	// it will default to the WP Admin page.
	const fullWpAdminUrl = addQueryArgs( { 'preferred-view': 'classic' }, wpAdminUrl );

	return (
		<div className="screen-switcher">
			<button
				className="screen-switcher__button"
				onClick={ () => onSwitch && onSwitch( DEFAULT_VIEW ) }
			>
				<strong>{ __( 'Default view' ) }</strong>
				{ __( 'Our WordPress.com redesign for a better experience.' ) }
			</button>
			<a
				className="screen-switcher__button"
				onClick={ () => onSwitch && onSwitch( CLASSIC_VIEW ) }
				href={ fullWpAdminUrl }
			>
				<strong>{ __( 'Classic view' ) }</strong>
				{ __( 'The classic WP-Admin WordPress interface.' ) }
			</a>
		</div>
	);
};

export default ScreenSwitcher;
