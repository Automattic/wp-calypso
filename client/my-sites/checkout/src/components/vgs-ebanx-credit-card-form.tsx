import {
	VGSCollectForm,
	VGSCollectFormState,
	VGSCollectHttpStatusCode,
	VGSCollectVaultEnvironment,
} from '@vgs/collect-js-react';
import { __ } from '@wordpress/i18n';
import React from 'react';
import { useVgsEbanxCreditCardForm } from './vgs-ebanx-credit-card-form-provider';

const { CardholderField, CardNumberField, CardExpirationDateField, CardSecurityCodeField } =
	VGSCollectForm;

const VGSCollectFieldStyles: Record< string, any > = {
	width: '100%',
	boxSizing: 'border-box',
	backgroundColor: '#fff',
	color: '#2b2d2f',
	fontFamily: 'Inter, sans-serif',
	minHeight: '0',
	padding: '14px 12px',
	boxShadow: 'inset 0 0 0 1px #e0e0e0',
	borderRadius: '4px',
};

export const VgsEbanxCreditCardForm = ( {
	styles = null,
	showFutureChargeNotice = true,
}: {
	styles?: Record< string, unknown > | null;
	showFutureChargeNotice?: boolean;
} ) => {
	const { isVGSCollectScriptLoaded, vaultId, environment } = useVgsEbanxCreditCardForm();

	const onSubmitCallback = ( status: VGSCollectHttpStatusCode, resp: unknown ) => {
		// eslint-disable-next-line no-console
		console.log( 'VGS Form submitted:', status, resp );
	};

	const onUpdateCallback = ( state: VGSCollectFormState ) => {
		// eslint-disable-next-line no-console
		console.log( 'VGS Form state updated:', state );
	};

	const onErrorCallback = ( errors: VGSCollectFormState ) => {
		// eslint-disable-next-line no-console
		console.log( 'VGS Form errors:', errors );
	};

	// Apply custom styles if provided
	const fieldStyles = styles?.input
		? {
				...VGSCollectFieldStyles,
				...styles.input,
		  }
		: VGSCollectFieldStyles;

	if ( ! isVGSCollectScriptLoaded ) {
		return (
			<div className="vgs-ebanx-credit-card-form">
				<div className="vgs-loading">Loading payment form...</div>
			</div>
		);
	}

	return (
		<>
			<div className="vgs-ebanx-credit-card-form">
				<VGSCollectForm
					vaultId={ vaultId as string }
					environment={ environment as VGSCollectVaultEnvironment }
					action="/post"
					submitParameters={ {} }
					onUpdateCallback={ onUpdateCallback }
					onSubmitCallback={ onSubmitCallback }
					onErrorCallback={ onErrorCallback }
					routeId="89527d8d-5366-445d-83c3-535daa44f19f"
				>
					<CardholderField css={ fieldStyles } />
					<CardNumberField css={ fieldStyles } />
					<CardExpirationDateField css={ fieldStyles } />
					<CardSecurityCodeField css={ fieldStyles } />
				</VGSCollectForm>
				{ showFutureChargeNotice && (
					<span className="future-use-text" data-testid="future-use-text">
						{ __(
							'By providing your card information, you allow your card be charged for future payments.',
							'calypso'
						) }
					</span>
				) }
			</div>
		</>
	);
};
