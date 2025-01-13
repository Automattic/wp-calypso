import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { Plans, HelpCenter } from '@automattic/data-stores';
import formatCurrency from '@automattic/format-currency';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useState } from 'react';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { statTypeToPlan } from '../stat-type-to-plan';

import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

interface Props {
	title: string;
	features: ReactNode[];
	image: string;
	statType: string;
	expandableView?: boolean;
	mainFeatureLimit?: number;
	expandText?: string;
}

export default function StatsUpsell( {
	title,
	features,
	image,
	statType,
	expandableView = false,
	mainFeatureLimit = 4,
	expandText = 'Show more',
}: Props ) {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const plans = Plans.usePlans( { coupon: undefined } );
	const planKey = statTypeToPlan( statType );
	const plan = plans?.data?.[ planKey ];
	const pricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ planKey ],
		siteId: selectedSiteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
	} )?.[ planKey ];
	const planSlug = plan?.pathSlug ?? planKey;
	const isLoading = plans.isLoading || ! pricing;
	const isOdysseyStats = isEnabled( 'is_odyssey' );
	const eventPrefix = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
	const { setShowHelpCenter, setShowSupportDoc } = useDataStoreDispatch( HELP_CENTER_STORE );
	const localizeUrl = useLocalizeUrl();
	const [ isExpanded, setIsExpanded ] = useState( false );
	const redirectTo = encodeURIComponent( window.location.href );

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		recordTracksEvent( `${ eventPrefix }_stats_upsell_submit`, {
			stat_type: statType,
		} );
		if ( isOdysseyStats ) {
			const checkoutProductUrl = new URL(
				`https://wordpress.com/checkout/${ siteSlug }/${ planSlug }?redirect_to=${ redirectTo }`
			);
			window.open( checkoutProductUrl, '_self' );
		} else {
			page( `/checkout/${ siteSlug }/${ planSlug }?redirect_to=${ redirectTo }` );
		}
	};

	const learnMoreLink = localizeUrl( 'https://wordpress.com/support/stats/' );

	const toggleExpanded = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		if ( expandableView ) {
			event.stopPropagation();

			if ( ! isExpanded ) {
				recordTracksEvent( `${ eventPrefix }_stats_upsell_expand`, {
					stat_type: statType,
				} );
			}
			setIsExpanded( ! isExpanded );
		}
	};

	const getMainFeatures = () => {
		if ( ! expandableView ) {
			return features;
		}

		return features.filter( ( feature, index ) => index < mainFeatureLimit );
	};

	const getExpandedFeatures = () => {
		if ( ! expandableView ) {
			return [];
		}

		return features.filter( ( feature, index ) => index >= mainFeatureLimit );
	};

	const onLearnMoreClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		if ( ! isOdysseyStats ) {
			setShowHelpCenter( true );
			setShowSupportDoc( learnMoreLink );
		} else {
			window.open( learnMoreLink, '_blank' );
		}

		recordTracksEvent( `${ eventPrefix }_stats_upsell_learn_more`, {
			stat_type: statType,
		} );
	};

	return (
		<div className="stats-upsell">
			<TrackComponentView
				eventName={ `${ eventPrefix }_stats_upsell_view` }
				eventProperties={ {
					stat_type: statType,
				} }
			/>
			<div className="stats-upsell__content">
				<div className="stats-upsell__left">
					<div className="stats-upsell__left-inner">
						<Icon icon={ lock } size={ 40 } />
						<h1 className="stats-upsell__title">{ title }</h1>
						<div className="stats-upsell__text">
							{ ! pricing
								? ''
								: translate(
										'Get detailed insights into your site’s performance for {{b}}%(planPrice)s/month{{/b}} with a Personal plan.',
										{
											components: { b: <b /> },
											args: {
												planPrice: formatCurrency(
													pricing.discountedPrice.monthly ?? pricing.originalPrice.monthly ?? 0,
													pricing.currencyCode ?? '',
													{
														stripZeros: true,
														isSmallestUnit: true,
													}
												),
											},
										}
								  ) }
						</div>
						<div className="stats-upsell__features">
							{ getMainFeatures().map( ( feature, index ) => (
								<div className="stats-upsell__feature" key={ index }>
									<Gridicon icon="checkmark" size={ 18 } />
									<div className="stats-upsell__feature-text">{ feature }</div>
								</div>
							) ) }
						</div>
						<div className="stats-upsell__buttons">
							<Button
								variant="primary"
								className="stats-upsell__button"
								onClick={ onClick }
								disabled={ isLoading }
							>
								{ ! plan?.productNameShort
									? translate( 'Upgrade plan' )
									: translate( 'Upgrade to %(planName)s', {
											args: { planName: plan.productNameShort },
									  } ) }
							</Button>
							<Button
								variant="secondary"
								className="stats-upsell__button"
								onClick={ onLearnMoreClick }
							>
								{ translate( 'Learn more' ) }
							</Button>
						</div>
						{ expandableView && (
							<div className="stats-upsell__expand">
								{ ! isExpanded && (
									<Button onClick={ toggleExpanded }>
										{ expandText }
										<Gridicon icon="chevron-down" size={ 18 } />
									</Button>
								) }
								{ isExpanded && (
									<Button onClick={ toggleExpanded }>
										{ translate( 'Show less' ) }
										<Gridicon icon="chevron-up" size={ 18 } />
									</Button>
								) }
							</div>
						) }
						{ isExpanded && (
							<div className="stats-upsell__features">
								{ getExpandedFeatures().map( ( feature, index ) => (
									<div className="stats-upsell__feature" key={ index }>
										<Gridicon icon="checkmark" size={ 18 } />
										<div className="stats-upsell__feature-text">{ feature }</div>
									</div>
								) ) }
							</div>
						) }
					</div>
				</div>
				<div
					className={
						'stats-upsell__right ' +
						( expandableView && ! isExpanded ? 'stats-upsell_collapsed' : '' )
					}
				>
					<img src={ image } alt={ translate( 'Features' ) } />
				</div>
			</div>
		</div>
	);
}
