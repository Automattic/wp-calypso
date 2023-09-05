import { Button, JetpackLogo, WooLogo, CloudLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import Tooltip from 'calypso/components/tooltip';

import './style.scss';

// FIXME: These should be imported from a shared file when available
const JETPACK_HOSTING_WPCOM_BUSINESS = 'JETPACK_HOSTING_WPCOM_BUSINESS';
const JETPACK_HOSTING_WPCOM_ECOMMERCE = 'JETPACK_HOSTING_WPCOM_ECOMMERCE';

interface PlanInfo {
	title: string;
	description: string;
	price: string;
	interval: string;
	wpcomFeatures: string[];
	jetpackFeatures: string[];
	storage: string;
	logo: JSX.Element | null;
}

export default function CardContent( { planSlug }: { planSlug: string } ) {
	const translate = useTranslate();
	const tooltipRef = useRef< HTMLDivElement | null >( null );
	const [ showPopover, setShowPopover ] = useState( false );

	const getLogo = ( planSlug: string ) => {
		switch ( planSlug ) {
			case JETPACK_HOSTING_WPCOM_BUSINESS:
				return <CloudLogo />;
			case JETPACK_HOSTING_WPCOM_ECOMMERCE:
				return <WooLogo />;
			default:
				return null;
		}
	};

	const getPlanInfo = ( planSlug: string ): PlanInfo => {
		// FIXME: This is a placeholder until we have the real data
		return {
			title: 'Plan Title',
			description: 'Plan description goes here',
			price: '$25',
			interval: 'month',
			wpcomFeatures: [ 'Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5' ],
			jetpackFeatures:
				planSlug === JETPACK_HOSTING_WPCOM_BUSINESS
					? [ 'Feature 1', 'Feature 2', 'Feature 3', 'Feature 4' ]
					: [],
			storage: '50GB',
			logo: getLogo( planSlug ),
		};
	};

	const plan = getPlanInfo( planSlug );

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
				<Button className="wpcom-atomic-hosting__card-button" primary>
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
						plan.wpcomFeatures.map( ( feature ) => (
							<div
								key={ feature.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase() }
								className="wpcom-atomic-hosting__card-feature"
							>
								{ feature }
							</div>
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
						{ plan.jetpackFeatures.map( ( feature ) => (
							<div
								key={ feature.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase() }
								className="wpcom-atomic-hosting__card-feature"
							>
								{ feature }
							</div>
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
