/**
 * External dependencies
 */
import { Plan } from '@automattic/calypso-products';

const objectIsPlan = ( item: Record< string, unknown > | Plan ): item is Plan => {
	const requiredKeys = [
		'group',
		'type',
		'term',
		'getBillingTimeFrame',
		'getTitle',
		'getDescription',
		'getProductId',
		'getStoreSlug',
	];
	return requiredKeys.every( ( k ) => k in item );
};

export default objectIsPlan;
