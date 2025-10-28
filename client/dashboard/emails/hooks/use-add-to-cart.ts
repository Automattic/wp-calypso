import { useParams, useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { CartActionError } from '../../shopping-cart/errors';
import { getEmailCheckoutPath } from '../../utils/email-paths';
import { MailboxOperations } from '../entities/mailbox-operations';
import { getCartItems } from '../utils/get-cart-items';
import { getEmailProductProperties } from '../utils/get-email-product-properties';
import { useDomainFromUrlParam } from './use-domain-from-url-param';
import { useEmailProduct } from './use-email-product';

export const useAddToCart = () => {
	const { createErrorNotice } = useDispatch( noticesStore );
	const router = useRouter();
	const { provider, interval } = useParams( { strict: false } );
	const { domain, site } = useDomainFromUrlParam();

	const emailProduct = useEmailProduct( provider, interval );

	const addToCart = async ( {
		mailboxOperations,
		onFinally,
	}: {
		mailboxOperations: MailboxOperations;
		onFinally: () => void;
	} ) => {
		const { shoppingCartManagerClient } = await import(
			/* webpackChunkName: "async-load-shopping-cart" */ '../../app/shopping-cart'
		);

		const numberOfMailboxes = mailboxOperations.mailboxes.length;

		const emailProperties = getEmailProductProperties(
			provider,
			domain,
			emailProduct.product,
			numberOfMailboxes
		);

		const checkoutBasePath = getEmailCheckoutPath(
			site?.slug || '',
			domain.domain,
			router.state.location.pathname,
			mailboxOperations.mailboxes[ 0 ].getAsCartItem().email
		);

		const backUrl = window.location.origin + '/v2/emails';
		const checkoutPath = addQueryArgs( checkoutBasePath, { checkoutBackUrl: backUrl } );

		await shoppingCartManagerClient
			.forCartKey( site?.ID )
			.actions.addProductsToCart( [ getCartItems( mailboxOperations.mailboxes, emailProperties ) ] )
			.then( () => {
				window.location.href = checkoutPath;
			} )
			.finally( onFinally )
			.catch( ( error: CartActionError ) => {
				const actions = [];

				if ( error.code === 'already-contains-an-email-product' ) {
					actions.push( { label: __( 'Shopping cart' ), url: checkoutPath } );
				}

				createErrorNotice( error.message, { actions, type: 'snackbar' } );
			} );
	};

	return addToCart;
};
