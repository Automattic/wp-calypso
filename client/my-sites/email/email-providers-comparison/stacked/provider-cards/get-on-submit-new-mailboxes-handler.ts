import { ShoppingCartManagerActions } from '@automattic/shopping-cart';
import page from 'page';
import { canCurrentUserAddEmail, getCurrentUserCannotAddEmailReason } from 'calypso/lib/domains';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { GOOGLE_PROVIDER_NAME } from 'calypso/lib/gsuite/constants';
import { TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import { recordTracksEventAddToCartClick } from 'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/utils';
import getCartItems from 'calypso/my-sites/email/form/mailboxes/components/utilities/get-cart-items';
import {
	EmailProperties,
	getEmailProductProperties,
} from 'calypso/my-sites/email/form/mailboxes/components/utilities/get-email-product-properties';
import { MailboxOperations } from 'calypso/my-sites/email/form/mailboxes/components/utilities/mailbox-operations';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { errorNotice } from 'calypso/state/notices/actions';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

export type GetOnSubmitNewMailboxesHandlerProps = {
	comparisonContext: string;
	domain: ResponseDomain;
	dispatch: ( action: unknown ) => void;
	emailProduct: ProductListItem | null;
	isDomainInCart?: boolean;
	provider: EmailProvider;
	setAddingToCart: ( isAddingToCart: boolean ) => void;
	shoppingCartManager: ShoppingCartManagerActions;
	siteSlug: string;
	source: string;
};

const getEmailProductPropertiesForUpsell = (
	emailProduct: ProductListItem | null,
	newMailboxesCount: number
): EmailProperties => ( {
	existingItemsCount: 0,
	isAdditionalMailboxesPurchase: false,
	emailProduct: emailProduct as ProductListItem,
	newQuantity: newMailboxesCount,
	quantity: newMailboxesCount,
} );

const getOnSubmitNewMailboxesHandler =
	( {
		comparisonContext,
		isDomainInCart,
		dispatch,
		domain,
		emailProduct,
		provider,
		setAddingToCart,
		shoppingCartManager,
		siteSlug,
		source,
	}: GetOnSubmitNewMailboxesHandlerProps ) =>
	async ( mailboxOperations: MailboxOperations ) => {
		setAddingToCart( true );

		const userCanAddEmail = isDomainInCart || canCurrentUserAddEmail( domain );
		const userCannotAddEmailReason = userCanAddEmail
			? null
			: getCurrentUserCannotAddEmailReason( domain );

		const validated = await mailboxOperations.validateAndCheck( false );

		recordTracksEventAddToCartClick(
			comparisonContext,
			mailboxOperations.mailboxes.map( () => '' ),
			validated,
			provider === EmailProvider.Titan ? TITAN_PROVIDER_NAME : GOOGLE_PROVIDER_NAME,
			source ?? '',
			userCanAddEmail,
			userCannotAddEmailReason
		);

		if ( ! userCanAddEmail || ! validated ) {
			if ( ! userCanAddEmail ) {
				dispatch( errorNotice( userCannotAddEmailReason ) );
			}

			setAddingToCart( false );

			return;
		}

		const numberOfMailboxes = mailboxOperations.mailboxes.length;

		const emailProperties = ! isDomainInCart
			? getEmailProductProperties(
					provider,
					domain,
					emailProduct as ProductListItem,
					numberOfMailboxes
			  )
			: getEmailProductPropertiesForUpsell( emailProduct, numberOfMailboxes );

		shoppingCartManager
			.addProductsToCart( [ getCartItems( mailboxOperations.mailboxes, emailProperties ) ] )
			.then( () => {
				page( '/checkout/' + siteSlug );
			} )
			.finally( () => setAddingToCart( false ) )
			.catch( () => {
				// Nothing needs to be done here. CartMessages will display the error to the user.
			} );
	};

export default getOnSubmitNewMailboxesHandler;
