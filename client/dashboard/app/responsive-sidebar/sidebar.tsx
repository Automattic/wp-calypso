import { __, sprintf } from '@wordpress/i18n';
import RouterLinkButton from '../../components/router-link-button';
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';

import './sidebar.scss';

export default function Sidebar() {
	const { Logo, name } = useAppContext();
	const { recordTracksEvent } = useAnalytics();

	return (
		<div className="dashboard-responsive-sidebar__sidebar">
			{ Logo && (
				<div className="dashboard-responsive-sidebar__logo">
					<RouterLinkButton
						/* translators: Screen reader text for link to root of the hosting dashboard. "name" is the product of whose hosting dashboard this is: e.g. WordPress.com */
						aria-label={ sprintf( __( '%(name)s home' ), { name } ) }
						icon={ <Logo /> }
						to="/"
						onClick={ () => {
							recordTracksEvent( 'calypso_dashboard_logo_click' );
						} }
					/>
				</div>
			) }
		</div>
	);
}
