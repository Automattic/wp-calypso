import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { domainSuggestionsQuery } from '../../app/queries/domains';
import { siteCurrentPlanQuery } from '../../app/queries/site-plans';
import { Callout } from '../../components/callout';
import { TextBlur } from '../../components/text-blur';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { DomainUpsellIllustraction } from './upsell-illustration';
import type { Site } from '@automattic/api-core';

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
	tracksId,
}: {
	site: Site;
	title: string;
	description: string;
	upsellCTAButtonText: string;
	tracksId: string;
} ) => {
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const { search, suggestedDomain } = useDomainSuggestion( site );
	const { recordTracksEvent } = useAnalytics();

	const backUrl = window.location.href.replace( window.location.origin, '' );

	const handleChooseYourOwn = () => {
		recordTracksEvent( 'calypso_dashboard_upsell_click', {
			feature: tracksId,
			type: 'link',
		} );
	};

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

		if ( site.plan?.is_free || site.plan?.billing_period === 'Monthly' ) {
			window.location.href = addQueryArgs( `/plans/yearly/${ site.slug }`, {
				domain: true,
				domainAndPlanPackage: true,
				back_to: backUrl,
			} );
		} else {
			window.location.href = addQueryArgs( `/checkout/${ site.slug }`, {
				cancel_to: backUrl,
				redirect_to: backUrl,
			} );
		}
	};

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
							<Link
								to={ addQueryArgs( `${ window.location.origin }/domains/add/${ site.slug }`, {
									domainAndPlanPackage: true,
									domain: true,
									back_to: backUrl,
								} ) }
								onClick={ handleChooseYourOwn }
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
					target="_blank"
					text={ upsellCTAButtonText }
					variant="primary"
					size="compact"
					tracksId={ tracksId }
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
				upsellCTAButtonText={ __( 'Claim this domain' ) }
				tracksId="claim-this-domain"
			/>
		);
	}

	return (
		<DomainUpsellCardContent
			site={ site }
			title={ __( 'The perfect domain awaits' ) }
			description={ __(
				'<domain /> is a perfect domain for your site. Grab it now or <link>choose your own</link>.'
			) }
			upsellCTAButtonText={ __( 'Get this domain' ) }
			tracksId="get-this-domain"
		/>
	);
};

export default DomainUpsellCard;
