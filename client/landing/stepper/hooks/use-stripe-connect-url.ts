import { Onboard } from '@automattic/data-stores';
import { isNewsletterFlow } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import type { OnboardSelect } from '@automattic/data-stores';

type StripeConnectUrl = string | null;

type MembershipsData = {
	connect_url: string | undefined;
	connected_account_default_currency: string | undefined;
	connected_account_description: string | undefined;
	connected_account_id: string | undefined;
};

const fetchMembershipsData = ( siteId: number ): Promise< MembershipsData > =>
	wpcom.req.get( `/sites/${ siteId }/memberships/status`, { apiNamespace: 'wpcom/v2' } );

export function useStripeConnectUrl(
	siteId: number | undefined,
	flow: string | null
): StripeConnectUrl {
	const [ stripeConnectUrl, setStripeConnectUrl ] = useState< StripeConnectUrl >( null );

	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[]
	);

	const hasSubscriberGoal = goals.includes( Onboard.SiteGoal.PaidSubscribers );

	useEffect( () => {
		// Only make this extra request if we know we need
		// the stripe connect url - for newsletters sites
		// with paid-subscribers goal
		if ( siteId && isNewsletterFlow( flow ) && hasSubscriberGoal ) {
			fetchMembershipsData( siteId ).then( ( { connect_url } ) => {
				setStripeConnectUrl( connect_url || null );
			} );
		}
	}, [ siteId, flow, hasSubscriberGoal ] );

	return stripeConnectUrl;
}
