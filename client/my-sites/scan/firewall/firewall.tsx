import { Card, LoadingPlaceholder } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AllowList from './allow-list';
import AutomaticRules from './automatic-rules';
import BlockList from './block-list';
import BruteForce from './brute-force';
import { useWafQuery } from './data';

import './style.scss';

const FirewallSettingsLoadingPlaceholder = () => (
	<div className="firewall__loading-placeholder">
		<LoadingPlaceholder />
		<LoadingPlaceholder />
		<LoadingPlaceholder />
		<LoadingPlaceholder />
	</div>
);

/**
 * Jetpack Web Application Firewall (WAF) Settings Card
 */
export default function FirewallSettings() {
	const translate = useTranslate();

	const { isLoading, error } = useWafQuery();

	// Do not render if the site is not providing the required WAF API endpoint.
	if ( error ) {
		return null;
	}

	return (
		<div className="firewall">
			<Card compact className="setting-title">
				{ translate( 'Web Application Firewall (WAF)' ) }
			</Card>
			<Card>
				{ isLoading ? (
					<FirewallSettingsLoadingPlaceholder />
				) : (
					<>
						<AutomaticRules />
						<BruteForce />
						<BlockList />
					</>
				) }
			</Card>
			<Card>{ isLoading ? <FirewallSettingsLoadingPlaceholder /> : <AllowList /> }</Card>
		</div>
	);
}
