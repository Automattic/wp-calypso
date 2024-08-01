import { Card, Button } from '@automattic/components';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import { useSelector } from 'calypso/state';
import { getIsConnectedForSiteId } from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectStripe from './connect-stripe';
type Props = {
	nextStepUrl: string;
};

export default function PaidSubscribers( { nextStepUrl }: Props ) {
	const site = useSelector( getSelectedSite );

	const hasConnectedAccount = useSelector( ( state ) =>
		getIsConnectedForSiteId( state, site?.ID )
	);

	if ( ! hasConnectedAccount ) {
		return <ConnectStripe nextStepUrl={ nextStepUrl } />;
	}

	return (
		<Card>
			<QueryMembershipsSettings siteId={ site?.ID } source="calypso" />
			<h2>Paid newsletter offering</h2>
			<p>
				<strong>
					Review the plans retieved from Stripe and create euqivalent plans in WordPress.com
				</strong>{ ' ' }
				to prevent disruption to your current paid subscribers.
			</p>
			<Button primary>Contieneue</Button> <Button href={ nextStepUrl }>Skip for now</Button>
		</Card>
	);
}
