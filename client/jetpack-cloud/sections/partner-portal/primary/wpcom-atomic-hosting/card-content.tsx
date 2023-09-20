import { getPlan, PLAN_BUSINESS, PLAN_ECOMMERCE } from '@automattic/calypso-products';
import { Button, JetpackLogo, WooLogo, CloudLogo } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import Tooltip from 'calypso/components/tooltip';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import FeatureItem from './feature-item';

import './style.scss';

interface PlanInfo {
	title: string;
	description: string;
	price: string;
	interval: string;
	wpcomFeatures: Array< { text: string; tooltipText: string } >;
	jetpackFeatures: Array< { text: string; tooltipText: string } >;
	storage: string;
	logo: JSX.Element | null;
}

export default function CardContent( { planSlug }: { planSlug: string } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const tooltipRef = useRef< HTMLDivElement | null >( null );
	const [ showPopover, setShowPopover ] = useState( false );
	const { data: agencyProducts } = useProductsQuery();

	const getLogo = ( planSlug: string ) => {
		switch ( planSlug ) {
			case PLAN_BUSINESS:
				return <CloudLogo />;
			case PLAN_ECOMMERCE:
				return <WooLogo />;
			default:
				return null;
		}
	};

	const getCTAEventName = ( planSlug: string ) => {
		switch ( planSlug ) {
			case PLAN_BUSINESS:
				return 'calypso_jetpack_agency_dashboard_wpcom_atomic_hosting_business_cta_click';
			case PLAN_ECOMMERCE:
				return 'calypso_jetpack_agency_dashboard_wpcom_atomic_hosting_ecommerce_cta_click';
			default:
				return null;
		}
	};

	const getPlanInfo = ( planSlug: string ): PlanInfo => {
		const plan = getPlan( planSlug );
		const productId = plan?.getProductId?.();
		const agencyProduct = agencyProducts?.find(
			( agencyProduct ) => agencyProduct.product_id === productId
		);

		return {
			title: plan?.getTitle?.().toString() || '',
			description: plan?.getPlanTagline?.().toString() || '',
			price: formatCurrency( agencyProduct?.amount || 0, 'USD', { stripZeros: true } ),
			interval: 'month',
			wpcomFeatures: [
				{ text: 'Feature 1', tooltipText: 'Tooltip for Feature 1' },
				{ text: 'Feature 2', tooltipText: 'Tooltip for Feature 2' },
				{ text: 'Feature 3', tooltipText: 'Tooltip for Feature 3' },
				{ text: 'Feature 4', tooltipText: 'Tooltip for Feature 4' },
				{ text: 'Feature 5', tooltipText: 'Tooltip for Feature 5' },
			],
			jetpackFeatures:
				planSlug === PLAN_BUSINESS
					? [
							{ text: 'Feature 1', tooltipText: 'Tooltip for Feature 1' },
							{ text: 'Feature 2', tooltipText: 'Tooltip for Feature 2' },
							{ text: 'Feature 3', tooltipText: 'Tooltip for Feature 3' },
							{ text: 'Feature 4', tooltipText: 'Tooltip for Feature 4' },
					  ]
					: [],
			storage: '50GB',
			logo: getLogo( planSlug ),
		};
	};

	const plan = getPlanInfo( planSlug );

	const onCTAClick = useCallback( () => {
		dispatch( recordTracksEvent( getCTAEventName( planSlug ) ) );
	}, [ dispatch, planSlug ] );

	if ( ! plan ) {
		return null;
	}

	return (
		<>
			<div className="wpcom-atomic-hosting__card-content">
				{ plan.logo }
				<div className="wpcom-atomic-hosting__card-title">{ plan.title }</div>
				<div className="wpcom-atomic-hosting__card-description">{ plan.description }</div>
				<div className="wpcom-atomic-hosting__card-price">{ plan.price }</div>
				<div className="wpcom-atomic-hosting__card-interval">
					{ plan.interval === 'day' && translate( '/USD per license per day' ) }
					{ plan.interval === 'month' && translate( '/USD per license per month' ) }
				</div>
				<Button className="wpcom-atomic-hosting__card-button" primary onClick={ onCTAClick }>
					{ translate( 'Get %(title)s', {
						args: {
							title: plan.title,
						},
						comment: '%(title) is the plan title. Example: Get Business or Get Commerce',
					} ) }
				</Button>
				<div className="wpcom-atomic-hosting__card-features">
					<div className="wpcom-atomic-hosting__card-features-heading">
						{ translate( 'Everything in %(previousProductName)s, plus:', {
							args: { previousProductName: 'Product Name' }, // FIXME: This should be the plan name
						} ) }
					</div>
					{ plan.wpcomFeatures.length > 0 &&
						plan.wpcomFeatures.map( ( { text, tooltipText } ) => (
							<FeatureItem
								key={ text.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase() }
								feature={ text }
								tooltipText={ tooltipText }
							/>
						) ) }
				</div>
				{ plan.jetpackFeatures.length > 0 && (
					<div className="wpcom-atomic-hosting__card-features">
						<span
							className="wpcom-atomic-hosting__card-features-heading"
							onMouseEnter={ () => setShowPopover( true ) }
							onMouseLeave={ () => setShowPopover( false ) }
							onMouseDown={ () => setShowPopover( false ) }
							role="button"
							tabIndex={ 0 }
							ref={ tooltipRef }
						>
							<JetpackLogo size={ 16 } />
						</span>
						<Tooltip context={ tooltipRef.current } isVisible={ showPopover } position="right">
							{ translate(
								'Security, performance and growth tools made by the WordPress experts.'
							) }
						</Tooltip>
						{ plan.jetpackFeatures.map( ( { text, tooltipText } ) => (
							<FeatureItem
								key={ text.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase() }
								feature={ text }
								tooltipText={ tooltipText }
							/>
						) ) }
					</div>
				) }
			</div>
			<div>
				<div className="wpcom-atomic-hosting__card-heading">{ translate( 'STORAGE' ) }</div>
				<div className="wpcom-atomic-hosting__card-storage-amount">{ plan.storage }</div>
			</div>
		</>
	);
}
