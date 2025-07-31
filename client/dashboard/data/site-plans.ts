import wpcom from 'calypso/lib/wp';

export interface Plan {
	id?: string | null;
	currency_code: string;
	current_plan?: boolean;
	expiry?: string;
	formatted_price: string;
	has_domain_credit?: boolean;
	product_name: string;
	product_slug: string;
	raw_price_integer: number;
	subscribed_date?: string;
	user_facing_expiry?: string;
}

export async function fetchCurrentSitePlan( siteId: number ): Promise< Plan > {
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

export async function fetchSitePlanBySlug( siteId: number, productSlug: string ): Promise< Plan > {
	const plans: Record< string, Plan > = await wpcom.req.get( {
		path: `/sites/${ siteId }/plans`,
		apiVersion: '1.3',
	} );
	const plan = Object.values( plans ).find( ( plan ) => plan.product_slug === productSlug );
	if ( ! plan ) {
		throw new Error( `The plan ${ productSlug } cannot be found` );
	}
	return plan;
}
