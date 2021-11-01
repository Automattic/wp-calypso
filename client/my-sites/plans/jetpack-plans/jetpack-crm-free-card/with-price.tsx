import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
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
import type { Duration } from 'calypso/my-sites/plans/jetpack-plans/types';

import './style.scss';

const CRM_FREE_URL =
	'https://jetpackcrm.com/pricing?utm_source=jetpack&utm_medium=web&utm_campaign=pricing_i4&utm_content=pricing';

const useCrmFreeItem = () => {
	const translate = useTranslate();

	return useMemo(
		() => ( {
			isFree: true,
			displayName: translate( 'Jetpack CRM' ),
			features: {
				items: [
					{ text: translate( 'Unlimited contacts' ) },
					{ text: translate( 'Manage billing and create invoices' ) },
					{ text: translate( 'CRM fully integrated with WordPress' ) },
				],
			},
		} ),
		[ translate ]
	);
};

export type CardWithPriceProps = {
	duration: Duration;
	siteId: number | null;
};

const CardWithPrice: React.FC< CardWithPriceProps > = ( { duration, siteId } ) => {
	const translate = useTranslate();
	const crmFreeProduct = useCrmFreeItem();
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
			className={ classNames( 'jetpack-crm-free-card', 'with-price', {
				'is-jetpack-cloud': isJetpackCloud(),
			} ) }
			hideSavingLabel
			showStartingAt
			buttonPrimary
			item={ crmFreeProduct }
			headerLevel={ 3 }
			description={ translate( 'Build better relationships with your customers and clients.' ) }
			buttonLabel={ translate( 'Get CRM' ) }
			buttonURL={ CRM_FREE_URL }
			onButtonClick={ onButtonClick }
		/>
	);
};

export default CardWithPrice;
