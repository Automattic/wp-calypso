import { DotcomPlans, getPlanNames } from '@automattic/api-core';
import { sitePlanBySlugQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState, Suspense, lazy } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { wasEcommerceTrial } from '../../utils/site-trial';
import SiteDeleteModal from '../site-delete-modal';
import type { Site } from '@automattic/api-core';
import './style.scss';

const PlanPrice = lazy( () =>
	import(
		/* webpackChunkName: "async-load-automattic-components" */ '@automattic/components'
	).then( ( d ) => ( { default: d.PlanPrice } ) )
);

// Hard-coded product here to avoid using `@automattic/calypso-products` package.
// See packages/calypso-products/src/plans-list.tsx.
const getProduct = ( site: Site ) => {
	if ( wasEcommerceTrial( site ) ) {
		return {
			name: getPlanNames()[ DotcomPlans.ECOMMERCE ],
			tagline: __( 'Grow your online store with commerce-optimized extensions.' ),
			slug: 'ecommerce-bundle',
			pathSlug: 'ecommerce',
		};
	}

	return {
		name: getPlanNames()[ DotcomPlans.BUSINESS ],
		tagline: __( 'Unlock next-level WordPress with custom plugins and themes.' ),
		slug: 'business-bundle',
		pathSlug: 'business',
	};
};

const SiteTrialEnded = ( { siteSlug }: { siteSlug: string } ) => {
	const [ isSiteDeleteModalOpen, setIsSiteDeleteModalOpen ] = useState( false );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const product = getProduct( site );
	const { data: plan } = useQuery( sitePlanBySlugQuery( site.ID, product.slug ) );
	const backUrl = redirectToDashboardLink();

	if ( ! plan ) {
		return null;
	}

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Your free trial has ended' ) }
					description={ __(
						'Don’t lose all that hard work! Upgrade to a paid plan to continue working on your site.'
					) }
				/>
			}
			size="small"
		>
			<VStack spacing={ 4 }>
				<Card>
					<CardBody>
						<VStack>
							<HStack alignment="flex-start">
								<VStack spacing={ 1 } style={ { flex: 1 } }>
									<h2 className="site-trial-ended__title">{ product.name }</h2>
									<Text variant="muted">{ product.tagline }</Text>
								</VStack>
								<VStack spacing={ 1 } alignment="flex-end" style={ { flex: 1 } }>
									<Suspense fallback={ null }>
										<PlanPrice
											className="site-trial-ended__price"
											rawPrice={ ( plan.raw_price_integer * 100 ) / 12 / 100 }
											currencyCode={ plan.currency_code }
											isSmallestUnit
										/>
									</Suspense>
									<Text className="site-trial-ended__price-description" variant="muted">
										{ sprintf(
											/* translators: %(price)s is the price of the plan */
											__( 'per month, %(price)s billed annually, excl. taxes' ),
											{
												price: plan.formatted_price,
											}
										) }
									</Text>
								</VStack>
							</HStack>
							<ButtonStack>
								<UpsellCTAButton
									text={ __( 'Purchase plan' ) }
									upsellId="site-trial-ended"
									upsellFeatureId="site-trial"
									variant="primary"
									href={ addQueryArgs(
										wpcomLink( `/checkout/${ site.slug }/${ product.pathSlug }` ),
										{
											cancel_to: backUrl,
											redirect_to: backUrl,
										}
									) }
								/>
							</ButtonStack>
						</VStack>
					</CardBody>
				</Card>
				<HStack spacing={ 3 } justify="flex-start">
					<Text variant="muted">{ __( 'Not ready to upgrade?' ) }</Text>
					<ExternalLink href={ `/export/${ site.slug }` }>
						{ __( 'Export your content' ) }
					</ExternalLink>
					<Button variant="link" isDestructive onClick={ () => setIsSiteDeleteModalOpen( true ) }>
						{ __( 'Delete your site permanently' ) }
					</Button>
				</HStack>
				{ isSiteDeleteModalOpen && (
					<SiteDeleteModal site={ site } onClose={ () => setIsSiteDeleteModalOpen( false ) } />
				) }
			</VStack>
		</PageLayout>
	);
};

export default SiteTrialEnded;
