import { __ } from '@wordpress/i18n';
import NavigationHeader from 'calypso/components/navigation-header';

export default function WebServerSettings() {
	return (
		<div className="web-server-settings__main">
			<NavigationHeader title={ __( 'Web Server' ) } />
			<p>Web server settings</p>
		</div>
	);
}
