/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { SidebarContent, SiteHub } from '../components';
import { useLocation } from '../router';
import './app.scss';

export function Layout() {
	const { areas } = useLocation();
	return (
		<div className="a8c-site-admin__layout">
			<div className="a8c-site-admin__sidebar-region">
				<SiteHub
					isTransparent
					exitLabel={ __( 'Go to the Dashboard', 'a8c-site-admin' ) }
					exitLink="/"
				/>

				<SidebarContent shouldAnimate={ false } routeKey="home">
					{ areas.sidebar }
				</SidebarContent>
			</div>

			<div className="a8c-site-admin__area">{ areas.content }</div>
		</div>
	);
}
