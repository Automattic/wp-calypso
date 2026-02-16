import { siteBySlugQuery, stripeConfigurationQuery } from '@automattic/api-queries';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { checkoutRoute } from '../app/router/checkout';
import { shoppingCartManagerClient } from '../app/shopping-cart';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import CheckoutPageContent from './index';
import type { StripeConfiguration } from '@automattic/api-core';

/**
 * Wrapper component that sets up ShoppingCartProvider and StripeHookProvider for checkout
 */
export default function CheckoutPage() {
	const { siteSlug } = useParams( { strict: false } );
	const { productSlug, productMeta, productQuantity, subscriptionId, coupon } =
		checkoutRoute.useSearch();

	// Get site ID from slug
	const { data: site, isLoading: isLoadingSite } = useQuery( {
		...siteBySlugQuery( String( siteSlug ) ),
		enabled: !! siteSlug,
	} );

	// Fetch Stripe configuration
	const { data: stripeConfiguration } = useQuery(
		stripeConfigurationQuery( { payment_partner: 'stripe' } )
	);

	if ( ! siteSlug ) {
		return (
			<PageLayout>
				<PageHeader title={ __( 'Checkout' ) } />
				<div>{ __( 'Invalid checkout URL. Please specify a site.' ) }</div>
			</PageLayout>
		);
	}

	if ( isLoadingSite ) {
		return (
			<PageLayout>
				<PageHeader title={ __( 'Checkout' ) } />
				<div>{ __( 'Loading site…' ) }</div>
			</PageLayout>
		);
	}

	if ( ! site ) {
		return (
			<PageLayout>
				<PageHeader title={ __( 'Checkout' ) } />
				<div>{ __( 'Site not found.' ) }</div>
			</PageLayout>
		);
	}

	const defaultStripeConfig: StripeConfiguration = {
		js_url: '',
		public_key: '',
		processor_id: '',
	};

	return (
		<StripeHookProvider
			fetchStripeConfiguration={ () =>
				Promise.resolve( stripeConfiguration || defaultStripeConfig )
			}
		>
			<ShoppingCartProvider
				managerClient={ shoppingCartManagerClient }
				options={ { defaultCartKey: site.ID } }
			>
				<CheckoutPageContent
					site={ site }
					productSlug={ productSlug }
					productMeta={ productMeta }
					productQuantity={ productQuantity }
					subscriptionId={ subscriptionId }
					coupon={ coupon }
				/>
			</ShoppingCartProvider>
		</StripeHookProvider>
	);
}
