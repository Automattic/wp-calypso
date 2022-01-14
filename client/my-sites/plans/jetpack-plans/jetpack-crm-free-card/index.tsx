import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	TERM_ANNUALLY,
	PRODUCT_JETPACK_CRM_FREE,
	PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import { storePlan } from 'calypso/jetpack-connect/persistence-utils';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { ITEM_TYPE_PLAN } from 'calypso/my-sites/plans/jetpack-plans/constants';
import type { Duration, SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

const CRM_FREE_URL =
	'https://jetpackcrm.com/pricing?utm_source=jetpack&utm_medium=web&utm_campaign=pricing_i4&utm_content=pricing';

const useCrmFreeItem = ( duration: Duration ): SelectorProduct => {
	const translate = useTranslate();

	return useMemo(
		() => ( {
			productSlug:
				duration === TERM_MONTHLY ? PRODUCT_JETPACK_CRM_FREE_MONTHLY : PRODUCT_JETPACK_CRM_FREE,
			isFree: true,
			displayName: translate( 'Jetpack CRM' ),
			features: {
				items: [
					{ slug: 'not used', text: translate( 'Unlimited contacts' ) },
					{ slug: 'not used', text: translate( 'Manage billing and create invoices' ) },
					{ slug: 'not used', text: translate( 'CRM fully integrated with WordPress' ) },
				],
			},
			type: ITEM_TYPE_PLAN, // not used
			term: TERM_ANNUALLY, // not used
			iconSlug: 'not used',
			shortName: 'not used',
			tagline: 'not used',
			description: 'not used',
		} ),
		[ duration, translate ]
	);
};

export type CardWithPriceProps = {
	duration: Duration;
	siteId: number | null;
};

const CardWithPrice: React.FC< CardWithPriceProps > = ( { duration, siteId } ) => {
	const translate = useTranslate();
	const crmFreeProduct = useCrmFreeItem( duration );
	const slug = useMemo(
		() =>
			duration === TERM_MONTHLY ? PRODUCT_JETPACK_CRM_FREE_MONTHLY : PRODUCT_JETPACK_CRM_FREE,
		[ duration ]
	);

	const dispatch = useDispatch();
	const trackCallback = useCallback(
		() =>
			dispatch(
				recordTracksEvent( 'calypso_product_jpcrmfree_click', {
					site_id: siteId ?? undefined,
				} )
			),
		[ dispatch, siteId ]
	);

	const onButtonClick = useCallback( () => {
		storePlan( slug );
		trackCallback();
	}, [ slug, trackCallback ] );

	return (
		<JetpackProductCard
			className={ classNames( 'jetpack-crm-free-card', {
				'is-jetpack-cloud': isJetpackCloud(),
			} ) }
			hideSavingLabel
			showAbovePriceText
			buttonPrimary
			item={ crmFreeProduct }
			headerLevel={ 3 }
			description={ translate( 'Build better relationships with your customers and clients.' ) }
			buttonLabel={ translate( 'Get CRM' ) }
			buttonURL={ CRM_FREE_URL }
			onButtonClick={ onButtonClick }
			collapseFeaturesOnMobile
		/>
	);
};

export default CardWithPrice;
