import wpcom from 'calypso/lib/wp';

export interface Plan {
	id: string | null;
	current_plan?: boolean;
	expiry?: string;
	subscribed_date?: string;
	user_facing_expiry?: string;
}

export async function fetchCurrentSitePlan( siteId: string ): Promise< Plan > {
	const plans: Record< string, Plan > = await wpcom.req.get( {
		path: `/sites/${ siteId }/plans`,
		apiVersion: '1.3',
	} );
	const plan = Object.values( plans ).find( ( plan ) => plan.current_plan );
	if ( ! plan ) {
		throw new Error( 'No current plan found' );
	}
	return plan;
}
