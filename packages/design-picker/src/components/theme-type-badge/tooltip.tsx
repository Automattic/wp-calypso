import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button as LinkButton } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import {
	DOT_ORG_THEME,
	MARKETPLACE_THEME,
	PREMIUM_THEME,
	WOOCOMMERCE_THEME,
} from '../../constants';

interface Props {
	id: string;
	type: string;
	isPurchased: boolean;
	canUseTheme: boolean;
	subscriptionPrices: { year?: string; month?: string };
	siteSlug?: string;
}

const Tooltip = ( { id, type, isPurchased, canUseTheme, subscriptionPrices, siteSlug }: Props ) => {
	const translate = useTranslate();

	useEffect( () => {
		recordTracksEvent( 'calypso_upgrade_nudge_impression', {
			cta_name: 'theme-upsell-popup',
			theme: id,
		} );
	}, [ id ] );

	const goToCheckout = ( plan: string ) => {
		recordTracksEvent( 'calypso_theme_tooltip_upgrade_nudge_click', { plan } );

		if ( siteSlug ) {
			const params = new URLSearchParams();
			params.append( 'redirect_to', window.location.href.replace( window.location.origin, '' ) );

			window.location.href = `/checkout/${ encodeURIComponent(
				siteSlug
			) }/${ plan }?${ params.toString() }`;
		}
	};

	let header;
	if ( type === DOT_ORG_THEME ) {
		header = translate( 'Community theme', {
			context: 'This theme is developed and supported by a community',
			textOnly: true,
		} );
	} else if ( type === MARKETPLACE_THEME ) {
		header = translate( 'Paid theme' );
	} else if ( type === WOOCOMMERCE_THEME ) {
		header = translate( 'WooCommerce theme' );
	} else {
		header = translate( 'Premium theme' );
	}

	let message;
	if ( type === PREMIUM_THEME ) {
		if ( isPurchased ) {
			message = translate( 'You have purchased this theme.' );
		} else if ( canUseTheme ) {
			message = translate( 'This premium theme is included in your plan.' );
		} else {
			message = createInterpolateElement(
				/* translators: the "price" is the price of the theme, example: US$50; */
				translate( 'This premium theme is included in the <Link>Premium plan</Link>.' ),
				{
					Link: <LinkButton isLink onClick={ () => goToCheckout( 'premium' ) } />,
				}
			);
		}
	} else if ( type === DOT_ORG_THEME ) {
		message = canUseTheme
			? translate( 'This community theme is included in your plan.' )
			: createInterpolateElement(
					translate(
						'This community theme can only be installed if you have the <Link>Business plan</Link> or higher on your site.'
					),
					{
						Link: <LinkButton isLink onClick={ () => goToCheckout( 'business' ) } />,
					}
			  );
	} else if ( type === WOOCOMMERCE_THEME ) {
		message = canUseTheme
			? translate( 'This WooCommerce theme is included in your plan.' )
			: createInterpolateElement(
					translate( 'This WooCommerce theme is included in the <Link>Business plan</Link>.' ),
					{
						Link: <LinkButton isLink onClick={ () => goToCheckout( 'business' ) } />,
					}
			  );
	} else if ( type === MARKETPLACE_THEME ) {
		if ( isPurchased && canUseTheme ) {
			message = translate(
				'You have a subscription for this theme, and it will be usable as long as you keep a Business plan or higher on your site.'
			);
		} else if ( isPurchased && ! canUseTheme ) {
			message = createInterpolateElement(
				translate(
					'You have a subscription for this theme, but it will only be usable if you have the <link>Business plan</link> on your site.'
				),
				{
					link: <LinkButton isLink onClick={ () => goToCheckout( 'business' ) } />,
				}
			);
		} else if ( ! isPurchased && canUseTheme ) {
			// This is a third-party theme and the user has an eligible plan.
			/* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
			message = translate(
				'This premium theme is only available while your current plan is active and costs %(annualPrice)s per year or %(monthlyPrice)s per month.',
				{
					args: {
						annualPrice: subscriptionPrices?.year ?? '',
						monthlyPrice: subscriptionPrices?.month ?? '',
					},
				}
			);
		} else if ( ! isPurchased && ! canUseTheme ) {
			// This is a third-party theme but the user doesn't have an eligible plan.
			message = createInterpolateElement(
				/* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
				translate(
					'This premium theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can only be purchased if you have the <Link>Business plan</Link> on your site.',
					{
						args: {
							annualPrice: subscriptionPrices?.year ?? '',
							monthlyPrice: subscriptionPrices?.month ?? '',
						},
					}
				) as string,
				{
					Link: <LinkButton isLink onClick={ () => goToCheckout( 'business' ) } />,
				}
			);
		}
	}

	return (
		<>
			<div data-testid="upsell-header" className="theme-type-badge-tooltip__header">
				{ header }
			</div>
			<div data-testid="upsell-message">{ message }</div>
		</>
	);
};

export default Tooltip;
