import {
	getPlan,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PREMIUM,
	getPlanFeaturesObject,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, JetpackLogo, WooLogo, CloudLogo, Tooltip } from '@automattic/components';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import useIssueLicenses from 'calypso/jetpack-cloud/sections/partner-portal/hooks/use-issue-licenses';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { infoNotice } from 'calypso/state/notices/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { useSiteGlobalStylesOnPersonal } from 'calypso/state/sites/hooks/use-site-global-styles-on-personal';
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

export default function CardContent( {
	planSlug,
	isRequesting,
	setIsRequesting,
}: {
	planSlug: string;
	isRequesting: boolean;
	setIsRequesting: any;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const tooltipRef = useRef< HTMLDivElement | null >( null );
	const [ showPopover, setShowPopover ] = useState( false );
	const { data: agencyProducts } = useProductsQuery();
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );

	// Set a prop on the window object on whether Global Styles is available on the Personal plan.
	useSiteGlobalStylesOnPersonal();

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

	const getFeaturesHeading = ( planSlug: string ) => {
		switch ( planSlug ) {
			case PLAN_BUSINESS:
				return translate( 'Everything in {{a}}%(planName)s{{/a}}, plus:', {
					args: { planName: getPlan( PLAN_PREMIUM )?.getTitle() ?? '' },
					components: {
						a: (
							// For Business plan, we want to redirect user to find out more about features included in the  Premium plan.
							<a
								href="https://wordpress.com/pricing/#lpc-pricing"
								target="_blank"
								rel="noreferrer"
							/>
						),
					},
				} );
			case PLAN_ECOMMERCE:
				return translate( 'Everything in %(planName)s, plus:', {
					args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
				} );
			default:
				return '';
		}
	};

	const getProductTagline = ( planSlug: string ) => {
		switch ( planSlug ) {
			case PLAN_BUSINESS:
				return translate( 'Unlock the power of WordPress with plugins and cloud tools.' );
			case PLAN_ECOMMERCE:
				return translate( 'Create a powerful online store with built-in premium extensions.' );
			default:
				return '';
		}
	};

	const getPlanInfo = ( planSlug: string ): PlanInfo => {
		const plan = getPlan( planSlug );

		const planFeatures = plan?.get2023PricingGridSignupWpcomFeatures?.() || [];
		const planFeaturesObject = getPlanFeaturesObject( planFeatures );
		const jetpackFeatures = plan?.get2023PricingGridSignupJetpackFeatures?.() || [];
		const jetpackFeaturesObject = getPlanFeaturesObject( jetpackFeatures );

		const agencyProduct = agencyProducts?.find(
			( agencyProduct ) => agencyProduct.product_id === plan?.getProductId?.()
		);

		return {
			title: plan?.getTitle?.().toString() || '',
			description: getProductTagline( planSlug ) || '',
			price: formatCurrency(
				parseFloat( agencyProduct?.amount as string ) || 0,
				agencyProduct?.currency || 'USD',
				{
					stripZeros: true,
				}
			),
			interval: 'month',
			wpcomFeatures: planFeaturesObject.map( ( feature ) => ( {
				text: ( feature?.getTitle?.() as string ) || '',
				tooltipText: ( feature?.getDescription?.() as string ) || '',
			} ) ),
			jetpackFeatures: jetpackFeaturesObject.map( ( feature ) => ( {
				text: ( feature?.getTitle?.() as string ) || '',
				tooltipText: ( feature?.getDescription?.() as string ) || '',
			} ) ),
			storage: '50GB',
			logo: getLogo( planSlug ),
		};
	};

	const plan = getPlanInfo( planSlug );

	const { issueLicenses } = useIssueLicenses();

	const onCTAClick = useCallback( () => {
		const productSlug =
			planSlug === PLAN_BUSINESS ? 'wpcom-hosting-business' : 'wpcom-hosting-ecommerce';

		if ( paymentMethodRequired ) {
			const nextStep = addQueryArgs(
				{
					product: productSlug,
					source: 'create-site',
				},
				partnerPortalBasePath( '/payment-methods/add' )
			);

			page( nextStep );
			return;
		}

		setIsRequesting( true );

		dispatch( infoNotice( translate( 'A new WordPress.com site is on the way!' ) ) );
		dispatch( recordTracksEvent( getCTAEventName( planSlug ) ) );

		issueLicenses( [ { slug: productSlug, quantity: 1 } ] );

		setIsRequesting( false );
		page.redirect( `/dashboard?provisioning=true` );
	}, [ planSlug, paymentMethodRequired, setIsRequesting, dispatch, translate, issueLicenses ] );

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
				<Button
					className="wpcom-atomic-hosting__card-button"
					primary
					onClick={ onCTAClick }
					disabled={ isRequesting }
				>
					{ translate( 'Get %(title)s', {
						args: {
							title: plan.title,
						},
						comment: '%(title) is the plan title. Example: Get Business or Get Commerce',
					} ) }
				</Button>
				<div className="wpcom-atomic-hosting__card-features">
					<div className="wpcom-atomic-hosting__card-features-heading">
						{ getFeaturesHeading( planSlug ) }
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
