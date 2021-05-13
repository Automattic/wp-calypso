/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import type { TranslateResult } from 'i18n-calypso';
import { useDisplayCartMessages } from '@automattic/wpcom-checkout';
import type { ResponseCart, ResponseCartMessage } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { JETPACK_SUPPORT } from 'calypso/lib/url/support';

export type CalypsoCartMessage = {
	code: string;
	message: string | TranslateResult;
};

export default function CartMessages( {
	cart,
	isLoadingCart,
}: {
	cart: ResponseCart;
	isLoadingCart: boolean;
} ): null {
	const reduxDispatch = useDispatch();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const showErrorMessages = useCallback(
		( messages: ResponseCartMessage[] ) => {
			reduxDispatch(
				errorNotice(
					messages.map(
						( message ): React.ReactNode => (
							<p key={ `${ message.code }-${ message.message }` }>
								{ getPrettyErrorMessage( message, { translate, selectedSiteSlug } ) }
							</p>
						)
					),
					{ isPersistent: true }
				)
			);
		},
		[ selectedSiteSlug, reduxDispatch, translate ]
	);

	const showSuccessMessages = useCallback(
		( messages: ResponseCartMessage[] ) => {
			reduxDispatch(
				successNotice(
					messages.map(
						( message: CalypsoCartMessage ): React.ReactNode => (
							<p key={ `${ message.code }-${ message.message }` }>{ message.message }</p>
						)
					)
				)
			);
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

function getPrettyErrorMessage(
	error: ResponseCartMessage,
	{
		translate,
		selectedSiteSlug,
	}: {
		translate: ReturnType< typeof useTranslate >;
		selectedSiteSlug: string | null | undefined;
	}
): TranslateResult | string {
	switch ( error.code ) {
		case 'chargeback':
			return getChargebackErrorMessage( { translate, selectedSiteSlug } );

		case 'blocked':
			return getBlockedPurchaseErrorMessage( { translate, selectedSiteSlug } );

		case 'invalid-product-multisite':
			return getInvalidMultisitePurchaseErrorMessage( { translate, message: error.message } );

		default:
			return error.message;
	}
}
