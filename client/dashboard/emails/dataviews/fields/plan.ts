import { GoogleWorkspaceSlugs } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { TitanPlanTier } from '../../types';
import { getTitanTierFromSlug, getTitanTierName } from '../../utils/titan-tiers';
import type { Email } from '../../types';
import type { Field } from '@wordpress/dataviews';

const GOOGLE_BUSINESS_STARTER = 'business_starter';

const GOOGLE_BUSINESS_STARTER_SLUGS: string[] = [
	GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
];

const getPlan = ( item: Email ): string | undefined => {
	if ( item.provider === 'titan' ) {
		return getTitanTierFromSlug( item.productSlug );
	}

	if (
		item.provider === 'google_workspace' &&
		item.productSlug &&
		GOOGLE_BUSINESS_STARTER_SLUGS.includes( item.productSlug )
	) {
		return GOOGLE_BUSINESS_STARTER;
	}

	return undefined;
};

const getPlanElements = () => [
	...Object.values( TitanPlanTier ).map( ( tier ) => ( {
		value: tier as string,
		label: getTitanTierName( tier ),
	} ) ),
	{ value: GOOGLE_BUSINESS_STARTER, label: __( 'Business Starter' ) },
];

export const planField: Field< Email > = {
	id: 'plan',
	label: __( 'Plan' ),
	enableSorting: false,
	render: ( { item }: { item: Email } ) => {
		const plan = getPlan( item );
		return getPlanElements().find( ( element ) => element.value === plan )?.label ?? null;
	},
	getValue: ( { item }: { item: Email } ) => getPlan( item ) ?? '',
	elements: getPlanElements(),
};
