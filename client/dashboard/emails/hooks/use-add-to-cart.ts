import { useParams, useRouter, useSearch } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import { emailsRoute, mailboxesReadyRoute } from '../../app/router/emails';
import { dashboardLink, wpcomLink } from '../../utils/link';
import { MailboxOperations } from '../entities/mailbox-operations';
import { getCartItems } from '../utils/get-cart-items';
import { getEmailProductProperties } from '../utils/get-email-product-properties';
import { useDomainFromUrlParam } from './use-domain-from-url-param';
import { useEmailProduct } from './use-email-product';
import type { CartActionError } from '@automattic/shopping-cart';

export const useAddToCart = () => {
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice } = useDispatch( noticesStore );
	const { provider, interval } = useParams( { strict: false } );
	const { tier } = useSearch( { strict: false } );
	const { domain, domainName, site } = useDomainFromUrlParam();

	const emailProduct = useEmailProduct( provider, interval, domain, tier );
	const router = useRouter();

	const addToCart = async ( {
		mailboxOperations,
		onFinally,
	}: {
		mailboxOperations: MailboxOperations;
		onFinally: () => void;
	} ) => {
		// The cart item reads product_slug off the product, so bail if it hasn't
		// resolved (e.g. a tier whose product isn't available).
		const product = emailProduct.product;
		if ( ! product ) {
			onFinally();
			return;
		}

		const { shoppingCartManagerClient } = await import(
			/* webpackChunkName: "async-load-shopping-cart" */ '../../app/shopping-cart'
		);

		const numberOfMailboxes = mailboxOperations.mailboxes.length;

		const emailProperties = getEmailProductProperties(
			provider,
			domain,
			product,
			numberOfMailboxes
		);

		const redirectPath = router.buildLocation( {
			to: mailboxesReadyRoute.to,
			params: { domain: domain.domain },
			search: {
				mailboxes: mailboxOperations.mailboxes
					.map( ( mailbox ) => mailbox.getFieldValue( 'mailbox' ) )
					.join( ',' ),
			},
		} ).href;

		const backUrl =
			window.location.origin +
			router.buildLocation( {
				to: emailsRoute.to,
			} ).href;

		const checkoutPath = addQueryArgs( wpcomLink( '/checkout/' + site?.slug || '' ), {
			redirect_to: dashboardLink( redirectPath ),
			checkoutBackUrl: backUrl,
		} );

		await shoppingCartManagerClient
			.forCartKey( site?.ID )
			.actions.addProductsToCart( [ getCartItems( mailboxOperations.mailboxes, emailProperties ) ] )
			.then( () => {
				recordTracksEvent( 'calypso_dashboard_emails_add_mailbox_add_to_cart_success', {
					domainName,
					mailboxCount: mailboxOperations.mailboxes.length,
					provider,
				} );

				window.location.href = checkoutPath;
			} )
			.finally( onFinally )
			.catch( ( error: CartActionError ) => {
				recordTracksEvent( 'calypso_dashboard_emails_add_mailbox_add_to_cart_failure', {
					domainName,
					mailboxCount: mailboxOperations.mailboxes.length,
					provider,
					error: error.message,
				} );

				const actions = [];

				if ( error.code === 'already-contains-an-email-product' ) {
					actions.push( { label: __( 'Shopping cart' ), url: checkoutPath } );
				}

				createErrorNotice( error.message, { actions, type: 'snackbar' } );
			} );
	};

	return addToCart;
};
