import { domainSuggestionsQuery, siteCurrentPlanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { getDomainAndPlanUpsellUrl } from 'calypso/lib/domains';
import { Callout } from '../../components/callout';
import { TextBlur } from '../../components/text-blur';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { getCurrentDashboard, redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { DomainUpsellIllustraction } from './upsell-illustration';
import type { Site } from '@automattic/api-core';

/**
 * Returns true if the site requires a plan upgrade.
 */
const requiresPlanUpgrade = ( site: Site ) => {
	return site.plan?.is_free || site.plan?.billing_period === 'Monthly';
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
}: {
	site: Site;
	title: string;
	description: string;
	upsellCTAButtonText: string;
	upsellId: string;
} ) => {
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const { search, suggestedDomain } = useDomainSuggestion( site );

	const backUrl = redirectToDashboardLink( { supportBackport: true } );
	const handleUpsell = async () => {
		if ( suggestedDomain ) {
			setIsSubmitting( true );

			const { shoppingCartManagerClient } = await import(
				/* webpackChunkName: "async-load-shopping-cart" */ '../../app/shopping-cart'
			);
			await shoppingCartManagerClient.forCartKey( site.ID ).actions.replaceProductsInCart( [
				{
					product_slug: suggestedDomain?.product_slug ?? '',
					meta: suggestedDomain?.domain_name,
				},
			] );
		}

		if ( requiresPlanUpgrade( site ) ) {
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
		} )
	);

	return (
		<Callout
			title={ title }
			titleAs="h2"
			description={
				<Text variant="muted">
					{ createInterpolateElement( description, {
						domain: suggestedDomain ? (
							<span>{ suggestedDomain.domain_name }</span>
						) : (
							<TextBlur>{ search }</TextBlur>
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
			/>
		);
	}

	if ( requiresPlanUpgrade( site ) ) {
		return (
			<DomainUpsellCardContent
				site={ site }
				title={ __( 'The perfect domain awaits' ) }
				description={ __(
					'Upgrade to an annual paid plan to get <domain /> free for one year. You can also <link>choose your own domain name</link>.'
				) }
				upsellId="site-overview-get-this-domain"
				upsellCTAButtonText={ __( 'Choose a plan' ) }
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
		/>
	);
};

export default DomainUpsellCard;
