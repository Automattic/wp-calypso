import { isEnabled } from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import MigrationOffer from 'calypso/a8c-for-agencies/components/a4a-migration-offer';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIProductFamily } from 'calypso/state/partner-portal/types';
import SimpleList from '../../common/simple-list';
import { MarketplaceTypeContext } from '../../context';
import useProductAndPlans from '../../hooks/use-product-and-plans';
import { getCheapestPlan, getWPCOMCreatorPlan } from '../../lib/hosting';
import ListingSection from '../../listing-section';
import wpcomBulkOptions from '../../wpcom-overview/lib/wpcom-bulk-options';
import HostingCard from '../hosting-card';

import './style.scss';

interface Props {
	selectedSite?: SiteDetails | null;
}

export default function HostingList( { selectedSite }: Props ) {
	const translate = useTranslate();
	const activeAgency = useSelector( getActiveAgency );

	const { data } = useProductsQuery( false, true );

	const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );
	const { marketplaceType } = useContext( MarketplaceTypeContext );

	// Hide the section if it's automated referrals marketplace
	const hideSection = marketplaceType === 'referral' && isAutomatedReferrals;

	const wpcomProducts = data
		? ( data.find(
				( product ) => product.slug === 'wpcom-hosting'
		  ) as unknown as APIProductFamily )
		: undefined;

	const wpcomOptions = wpcomBulkOptions( wpcomProducts?.discounts?.tiers );

	const pressableOwnership = useMemo( () => {
		// Agencies can have pressable through A4A Licenses or via Pressable itself
		const hasPressablePlan = !! activeAgency?.third_party?.pressable?.pressable_id;

		if ( ! hasPressablePlan ) {
			return 'none';
		}

		// If the agency has a regular Pressable plan (not brought through A4A marketplace), A4A id is null.
		const hasRegularPressablePlan =
			hasPressablePlan && activeAgency?.third_party?.pressable?.a4a_id === null;

		return hasRegularPressablePlan ? 'regular' : 'agency';
	}, [ activeAgency ] );

	const { isLoadingProducts, pressablePlans, wpcomPlans } = useProductAndPlans( {
		selectedSite,
	} );

	const isWPCOMOptionEnabled = isEnabled( 'a8c-for-agencies/wpcom-creator-plan-purchase-flow' );

	const cheapestPressablePlan = useMemo(
		() => ( pressablePlans.length ? getCheapestPlan( pressablePlans ) : null ),
		[ pressablePlans ]
	);

	const highestDiscountPressable = 70; // FIXME: compute this value based on the actual data

	const creatorPlan = isWPCOMOptionEnabled ? getWPCOMCreatorPlan( wpcomPlans ) : null;

	const highestDiscountWPCOM = useMemo(
		() =>
			wpcomOptions.reduce(
				( highestDiscountPercentage, option ) =>
					option.discount * 100 > highestDiscountPercentage
						? option.discount * 100
						: highestDiscountPercentage,
				0
			),
		[ wpcomOptions ]
	);

	const vipPlan = useMemo(
		() => ( {
			amount: '$25k',
			currency: 'USD',
			family_slug: 'vip',
			name: translate( 'WordPress VIP' ),
			slug: 'vip',
			price_interval: '',
			supported_bundles: [],
			product_id: 0,
		} ),
		[ translate ]
	);

	// Track the tallest price section across hosting cards, to keep them aligned with each other.
	const [ minHostingCardPriceHeight, setMinHostingCardPriceHeight ] = useState( 0 );
	const hostingCardPriceHeightProps = {
		minPriceHeight: minHostingCardPriceHeight,
		setPriceHeight: ( height: number ): void => {
			setMinHostingCardPriceHeight( ( currentHeight ) => {
				if ( height > currentHeight ) {
					return height;
				}
				return currentHeight;
			} );
		},
	};

	if ( isLoadingProducts ) {
		return (
			<div className="hosting-list">
				<div className="hosting-list__placeholder" />
			</div>
		);
	}

	return (
		<div className="hosting-list">
			<ListingSection
				title={ translate( 'Hosting' ) }
				description={ translate(
					'Choose from a variety of world-class managed hosting that will scale with your business.'
				) }
				isTwoColumns
				extraContent={ <MigrationOffer foldable /> }
			>
				{ creatorPlan && (
					<HostingCard
						plan={ creatorPlan }
						highestDiscountPercentage={ highestDiscountWPCOM }
						{ ...hostingCardPriceHeightProps }
					/>
				) }

				{ cheapestPressablePlan && ! hideSection && (
					<HostingCard
						plan={ cheapestPressablePlan }
						pressableOwnership={ pressableOwnership }
						highestDiscountPercentage={ highestDiscountPressable }
						{ ...hostingCardPriceHeightProps }
					/>
				) }

				{ isWPCOMOptionEnabled && (
					<HostingCard
						plan={ vipPlan }
						className="hosting-list__vip-card"
						{ ...hostingCardPriceHeightProps }
					/>
				) }
			</ListingSection>
			{ isWPCOMOptionEnabled && ! hideSection && (
				<Card className="hosting-list__features">
					<h3 className="hosting-list__features-heading">
						{ translate( 'Included with Standard & Premier hosting' ) }
					</h3>
					<SimpleList
						className="hosting-list__features-list"
						items={ [
							<li>{ translate( 'Global edge caching' ) }</li>,
							<li>{ translate( 'Global CDN with 28+ locations' ) }</li>,
							<li>{ translate( 'Automated datacenter failover' ) }</li>,
							<li>{ translate( 'Free managed migrations' ) }</li>,
							<li>{ translate( 'Automated malware and security scanning via Jetpack' ) }</li>,
							<li>{ translate( 'Plugin update manager' ) }</li>,
							<li>{ translate( '24/7 expert support' ) }</li>,
							<li>{ translate( 'Free staging sites with sync tools' ) }</li>,
							<li>{ translate( 'SFTP/SSH, WP-CLI, Git tools' ) }</li>,
							<li>{ translate( '10 PHP workers with auto-scaling' ) }</li>,
							<li>{ translate( 'Resource isolation across every site' ) }</li>,
							<li>{ translate( 'Jetpack real-time backups' ) }</li>,
						] }
					/>
				</Card>
			) }
		</div>
	);
}
