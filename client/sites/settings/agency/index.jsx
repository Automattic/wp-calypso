import { __ } from '@wordpress/i18n';
import NavigationHeader from 'calypso/components/navigation-header';

export default function AgencySettings() {
	return (
		<div className="agency-settings">
			<NavigationHeader title={ __( 'Agency' ) } />
			<p>Agency settings</p>
		</div>
	);
}
