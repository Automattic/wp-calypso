import { isEnabled } from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import FilterSearch from 'calypso/a8c-for-agencies/components/filter-search';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { useDispatch } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamily } from 'calypso/state/partner-portal/types';
import SimpleList from '../../common/simple-list';
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
	const dispatch = useDispatch();
	const activeAgency = useSelector( getActiveAgency );

	const { data } = useProductsQuery( false, true );

	const wpcomProducts = data
		? ( data.find(
				( product ) => product.slug === 'wpcom-hosting'
		  ) as unknown as APIProductFamily )
		: undefined;

	const wpcomOptions = wpcomBulkOptions( wpcomProducts?.discounts?.tiers );

	const hasPressablePlan = useMemo( () => {
		// Agencies can have pressable through A4A Licenses or via Pressable itself
		return (
			!! activeAgency?.third_party?.pressable && activeAgency?.third_party?.pressable?.pressable_id
		);
	}, [ activeAgency ] );

	const [ productSearchQuery, setProductSearchQuery ] = useState< string >( '' );

	const { isLoadingProducts, pressablePlans, wpcomPlans } = useProductAndPlans( {
		selectedSite,
		productSearchQuery,
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

	const onProductSearch = useCallback(
		( value: string ) => {
			setProductSearchQuery( value );
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_overview_search_submit', { value } )
			);
		},
		[ dispatch ]
	);

	if ( isLoadingProducts ) {
		return (
			<div className="hosting-list">
				<div className="hosting-list__placeholder" />
			</div>
		);
	}

	return (
		<div className="hosting-list">
			<div className="hosting-list__actions">
				<FilterSearch label={ translate( 'Search products' ) } onSearch={ onProductSearch } />
			</div>

			<ListingSection
				title={ translate( 'Hosting' ) }
				description={ translate(
					'Choose the hosting that suits your needs from our best-in-class offerings.'
				) }
				isTwoColumns
			>
				{ creatorPlan && (
					<HostingCard plan={ creatorPlan } highestDiscountPercentage={ highestDiscountWPCOM } />
				) }

				{ cheapestPressablePlan && (
					<HostingCard
						plan={ cheapestPressablePlan }
						pressableOwnership={ !! hasPressablePlan }
						highestDiscountPercentage={ highestDiscountPressable }
					/>
				) }

				{ isWPCOMOptionEnabled && (
					<HostingCard plan={ vipPlan } className="hosting-list__vip-card" />
				) }
			</ListingSection>
			{ isWPCOMOptionEnabled && (
				<Card className="hosting-list__features">
					<h3 className="hosting-list__features-heading">
						{ translate( 'Included with WordPress.com and Pressable plans' ) }
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
							<li>{ translate( 'Real-time cloud backups via Jetpack' ) }</li>,
						] }
					/>
				</Card>
			) }
		</div>
	);
}
