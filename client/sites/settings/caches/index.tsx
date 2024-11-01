import { __ } from '@wordpress/i18n';
import NavigationHeader from 'calypso/components/navigation-header';

export default function CacheSettings() {
	return (
		<div className="cache-settings">
			<NavigationHeader title={ __( 'Caches' ) } />
			<p>Cache settings</p>
		</div>
	);
}
