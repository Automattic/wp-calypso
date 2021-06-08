/**
 * External dependencies
 */
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import type { TranslateResult } from 'i18n-calypso';
import { useDisplayCartMessages } from '@automattic/wpcom-checkout';
import type { ResponseCart, ResponseCartMessage } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { errorNotice, successNotice, removeNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { JETPACK_SUPPORT } from 'calypso/lib/url/support';

function CartMessage( { message }: { message: ResponseCartMessage } ): JSX.Element {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const getPrettyMessage = useMemo( () => getMessagePrettifier( translate, selectedSiteSlug ), [
		translate,
		selectedSiteSlug,
	] );
	return <>{ getPrettyMessage( message ) }</>;
}

export default function CartMessages( {
	cart,
	isLoadingCart,
}: {
	cart: ResponseCart;
	isLoadingCart: boolean;
} ): null {
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
						href={
							'https://wordpress.com/error-report/' +
							( selectedSiteSlug ? '?url=payment@' + selectedSiteSlug : '' )
						}
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
				href={ JETPACK_SUPPORT + 'backup/#does-jetpack-backup-support-multisite' }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'More info' ) }
			</a>
		</>
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
	reduxDispatch: ReturnType< typeof useDispatch >,
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
