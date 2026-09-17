import { SubscriptionBillPeriod } from '@automattic/api-core';
import { domainSuggestionsQuery, siteCurrentPlanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { getDomainAndPlanUpsellUrl } from 'calypso/lib/domains';
import { getCurrentDashboard } from '../../app/routing';
import { Callout } from '../../components/callout';
import { TextBlur } from '../../components/text-blur';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { dashboardLink, redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { DomainUpsellIllustraction } from './upsell-illustration';
import type { Site, SiteContextualPlan } from '@automattic/api-core';

/**
 * Returns true if the site requires a plan upgrade.
 *
 * The billing period is read from the plans endpoint rather than `site.plan.billing_period`
 * because the sites list endpoint omits that field. A site seeded from the list would
 * otherwise flip from "no upgrade needed" to "upgrade needed" once the full site loads.
 */
const requiresPlanUpgrade = ( site: Site, sitePlan: SiteContextualPlan ) => {
	return !! site.plan?.is_free || sitePlan.interval === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD;
};

const useDomainSuggestion = ( site: Site ) => {
	const search = site.slug.split( '.' )[ 0 ];
	const { data: allDomainSuggestions } = useQuery(
		domainSuggestionsQuery( search, {
			vendor: 'domain-upsell',
			include_wordpressdotcom: false,
		} )
	);

	return {
		search,
		suggestedDomain: allDomainSuggestions?.[ 0 ],
	};
};

const DomainUpsellCardContent = ( {
	site,
	title,
	description,
	upsellCTAButtonText,
	upsellId,
	isPlanUpgradeRequired,
}: {
	site: Site;
	title: string;
	description: string;
	upsellCTAButtonText: string;
	upsellId: string;
	isPlanUpgradeRequired: boolean;
} ) => {
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const { search, suggestedDomain } = useDomainSuggestion( site );
	const { createErrorNotice } = useDispatch( noticesStore );

	const backUrl = redirectToDashboardLink( { supportBackport: true } );
	const handleUpsell = async () => {
		if ( suggestedDomain ) {
			setIsSubmitting( true );

			try {
				const { shoppingCartManagerClient } = await import(
					/* webpackChunkName: "async-load-shopping-cart" */ '../../app/shopping-cart'
				);
				await shoppingCartManagerClient.forCartKey( site.ID ).actions.replaceProductsInCart( [
					{
						product_slug: suggestedDomain?.product_slug ?? '',
						meta: suggestedDomain?.domain_name,
					},
				] );
			} catch ( error ) {
				createErrorNotice(
					( error as Error ).message || __( 'Failed to claim domain. Please try again.' ),
					{ type: 'snackbar' }
				);
				setIsSubmitting( false );
				return;
			}
		}

		if ( isPlanUpgradeRequired ) {
			window.location.href = wpcomLink(
				getDomainAndPlanUpsellUrl( {
					siteSlug: site.slug,
					backUrl,
					step: 'plans',
				} )
			);
		} else {
			window.location.href = addQueryArgs( wpcomLink( `/checkout/${ site.slug }` ), {
				cancel_to: backUrl,
				redirect_to: backUrl,
				dashboard: getCurrentDashboard(),
			} );
		}
	};

	const chooseYourOwnUrl = wpcomLink(
		getDomainAndPlanUpsellUrl( {
			siteSlug: site.slug,
			backUrl,
			// Literal template to avoid pulling the dashboard router into tests.
			domainConnectionSetupUrl: dashboardLink( '/domains/%s/domain-connection-setup' ),
		} )
	);

	return (
		<Callout
			title={ title }
			titleAs="h2"
			description={
				// Remount when the string changes: page translators reparent the interpolated
				// text nodes, so React can't safely reconcile a differently shaped string.
				<Text key={ description } variant="muted">
					{ createInterpolateElement( description, {
						domain: (
							<TextBlur isBlurred={ ! suggestedDomain }>
								{ suggestedDomain ? suggestedDomain.domain_name : search }
							</TextBlur>
						),
						link: (
							<UpsellCTAButton
								variant="link"
								href={ chooseYourOwnUrl }
								upsellId="site-overview-choose-your-own-domain"
								upsellFeatureId="domain"
							/>
						),
					} ) }
				</Text>
			}
			image={
				<DomainUpsellIllustraction
					title={ __( 'Responsive website design' ) }
					domain={ suggestedDomain?.domain_name }
					search={ search }
				/>
			}
			imageVariant="full-bleed"
			actions={
				<UpsellCTAButton
					text={ upsellCTAButtonText }
					variant="primary"
					size="compact"
					upsellId={ upsellId }
					upsellFeatureId="domain"
					isBusy={ isSubmitting }
					onClick={ handleUpsell }
				/>
			}
		/>
	);
};

const DomainUpsellCard = ( { site }: { site: Site } ) => {
	const { data: sitePlan } = useQuery( siteCurrentPlanQuery( site.ID ) );
	if ( ! sitePlan ) {
		return null;
	}

	const isPlanUpgradeRequired = requiresPlanUpgrade( site, sitePlan );

	if ( sitePlan.has_domain_credit ) {
		return (
			<DomainUpsellCardContent
				site={ site }
				title={ __( 'Claim your free domain' ) }
				description={ __(
					'<domain /> is included free for one year with your paid plan. Claim this domain or <link>choose your own</link>.'
				) }
				upsellId="site-overview-claim-this-domain"
				upsellCTAButtonText={ __( 'Claim this domain' ) }
				isPlanUpgradeRequired={ isPlanUpgradeRequired }
			/>
		);
	}

	if ( isPlanUpgradeRequired ) {
		return (
			<DomainUpsellCardContent
				site={ site }
				title={ __( 'The perfect domain awaits' ) }
				description={ __(
					'Upgrade to an annual paid plan to get <domain /> free for one year. You can also <link>choose your own domain name</link>.'
				) }
				upsellId="site-overview-get-this-domain"
				upsellCTAButtonText={ __( 'Choose a plan' ) }
				isPlanUpgradeRequired={ isPlanUpgradeRequired }
			/>
		);
	}

	/**
	 * A site may have used their domain credit but detached the domain from the site (for whatever reason).
	 * In this case, we should show the domain upsell card.
	 */
	return (
		<DomainUpsellCardContent
			site={ site }
			title={ __( 'The perfect domain awaits' ) }
			description={ __(
				'<domain /> is a perfect domain for your site. Grab it now or <link>choose your own</link>.'
			) }
			upsellId="site-overview-get-this-domain"
			upsellCTAButtonText={ __( 'Get this domain' ) }
			isPlanUpgradeRequired={ isPlanUpgradeRequired }
		/>
	);
};

export default DomainUpsellCard;
