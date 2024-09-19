import { localizeUrl } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { JETPACK_CONTACT_SUPPORT, JETPACK_SUPPORT } from '@automattic/urls';
import { useDisplayCartMessages } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice, removeNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { ResponseCartMessage } from '@automattic/shopping-cart';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { TranslateResult } from 'i18n-calypso';

function CartMessage( { message }: { message: ResponseCartMessage } ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const getPrettyMessage = useMemo(
		() => getMessagePrettifier( translate, selectedSiteSlug ),
		[ translate, selectedSiteSlug ]
	);
	return <>{ getPrettyMessage( message ) }</>;
}

export default function CartMessages( {
	shouldShowPersistentErrors,
}: {
	/**
	 * Persistent errors like "Purchases are disabled for this site" are returned
	 * during cart fetch (regular cart errors are transient and only are returned
	 * when changing the cart). We want to display these errors only in certain
	 * contexts where they will make sense (like checkout), not in every place
	 * that happens to render this component (like the plans page).
	 */
	shouldShowPersistentErrors?: boolean;
} ): null {
	const cartKey = useCartKey();
	const { responseCart: cart, isLoading: isLoadingCart } = useShoppingCart( cartKey );
	const reduxDispatch = useDispatch();

	const showErrorMessages = useCallback(
		( messages: ResponseCartMessage[] ) => {
			showMessages( messages, reduxDispatch, 'error' );
		},
		[ reduxDispatch ]
	);

	const showSuccessMessages = useCallback(
		( messages: ResponseCartMessage[] ) => {
			showMessages( messages, reduxDispatch, 'success' );
		},
		[ reduxDispatch ]
	);

	useDisplayCartMessages( {
		cart,
		isLoadingCart,
		showErrorMessages,
		showSuccessMessages,
		shouldShowPersistentErrors: shouldShowPersistentErrors ?? false,
	} );

	return null;
}

function getChargebackErrorMessage( {
	translate,
	selectedSiteSlug,
}: {
	translate: ReturnType< typeof useTranslate >;
	selectedSiteSlug: string | null | undefined;
} ) {
	return translate(
		'{{strong}}Warning:{{/strong}} One or more transactions linked to this site were refunded due to a contested charge. ' +
			'This may have happened because of a chargeback by the credit card holder or a PayPal investigation. Each contested ' +
			'charge carries a fine. To resolve the issue and re-enable posting, please {{a}}pay for the chargeback fine{{/a}}.',
		{
			components: {
				strong: <strong />,
				a: <a href={ '/checkout/' + selectedSiteSlug ?? '' } />,
			},
		}
	);
}

function getBlockedPurchaseErrorMessage( {
	translate,
	selectedSiteSlug,
}: {
	translate: ReturnType< typeof useTranslate >;
	selectedSiteSlug: string | null | undefined;
} ) {
	return translate(
		'Purchases are currently disabled. Please {{a}}contact us{{/a}} to re-enable purchases.',
		{
			components: {
				a: (
					<a
						href={ `https://wordpress.com/account-assistance-form/${
							selectedSiteSlug ? '?url=payment@' + selectedSiteSlug : ''
						}` }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		}
	);
}

function getInvalidMultisitePurchaseErrorMessage( {
	translate,
	message,
}: {
	translate: ReturnType< typeof useTranslate >;
	message: string;
} ) {
	return (
		<>
			{ message }&nbsp;
			<a
				href={ localizeUrl( JETPACK_SUPPORT ) + 'backup/#does-jetpack-backup-support-multisite' }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'More info' ) }
			</a>
		</>
	);
}

function getJetpackLegacyUpgradeErrorMessage( {
	translate,
	message,
	selectedSiteSlug,
}: {
	translate: ReturnType< typeof useTranslate >;
	message: string;
	selectedSiteSlug: string | null | undefined;
} ) {
	return (
		<div style={ { maxWidth: '500px' } }>
			{ message }&nbsp;
			<a
				href={
					localizeUrl( JETPACK_CONTACT_SUPPORT ) +
					'&assistant=false&subject=' +
					encodeURIComponent( 'Help with Jetpack Legacy Upgrade' ) +
					( selectedSiteSlug ? '&url=' + selectedSiteSlug : '' )
				}
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'Contact Support' ) }
			</a>
		</div>
	);
}

// Use this to transform message strings into React components
function getMessagePrettifier(
	translate: ReturnType< typeof useTranslate >,
	selectedSiteSlug: string | null | undefined
) {
	return function getPrettyMessage( message: ResponseCartMessage ): TranslateResult | string {
		switch ( message.code ) {
			case 'chargeback':
				return getChargebackErrorMessage( { translate, selectedSiteSlug } );

			case 'blocked':
				return getBlockedPurchaseErrorMessage( { translate, selectedSiteSlug } );

			case 'invalid-product-multisite':
				return getInvalidMultisitePurchaseErrorMessage( { translate, message: message.message } );

			case 'invalid-jetpack-legacy-upgrade':
				return getJetpackLegacyUpgradeErrorMessage( {
					translate,
					message: message.message,
					selectedSiteSlug,
				} );

			default:
				return message.message;
		}
	};
}

// Use this to group messages so that they will replace existing messages with the same id
function getNoticeIdForMessage( message: ResponseCartMessage ): string {
	switch ( message.code ) {
		case 'coupon-not-found':
		case 'coupon-removed':
		case 'coupon-removed-invalid':
		case 'coupon-applied':
			return 'coupon-message';
		default:
			return message.code;
	}
}

function showMessages(
	messages: ResponseCartMessage[],
	reduxDispatch: CalypsoDispatch,
	messageType: 'error' | 'success'
): void {
	const messageActionCreator = messageType === 'error' ? errorNotice : successNotice;
	// Remove previous messages that match the codes we are about to display
	messages.map( ( message ) => {
		reduxDispatch( removeNotice( getNoticeIdForMessage( message ) ) );
	} );

	messages.map( ( message ) => {
		reduxDispatch(
			messageActionCreator( <CartMessage message={ message } />, {
				isPersistent: messageType === 'error',
				id: getNoticeIdForMessage( message ),
			} )
		);
	} );
}
