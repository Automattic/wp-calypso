import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import StripeLogo from 'calypso/assets/images/jetpack/stripe-logo-white.svg';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getConnectUrlForSiteId } from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type Props = {
	nextStepUrl: string;
};

export default function ConnectStripe( { nextStepUrl }: Props ) {
	const site = useSelector( getSelectedSite );
	const connectUrl: string = useSelector( ( state ) => getConnectUrlForSiteId( state, site?.ID ) );

	return (
		<Card>
			<QueryMembershipsSettings siteId={ site?.ID } source="import-paid-subscribers" />
			<h2>Finish importing paid subscribers</h2>
			<p>
				To your migrate <strong>17 paid subscribers</strong> to WordPress.com, make sure you're
				connecting the same Stripe account you use with Substack.
			</p>
			<Button
				variant="primary"
				href={ connectUrl }
				onClick={ () => {
					recordTracksEvent( 'calypso_paid_importer_connect_stripe' );
				} }
			>
				Connect <img src={ StripeLogo } className="stripe-logo" width="48px" alt="Stripe logo" />
			</Button>{ ' ' }
			<Button
				variant="secondary"
				href={ nextStepUrl }
				onClick={ () => {
					recordTracksEvent( 'calypso_paid_importer_connect_stripe_skipped' );
				} }
			>
				Skip for now
			</Button>
		</Card>
	);
}
