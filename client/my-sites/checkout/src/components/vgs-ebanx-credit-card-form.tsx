/**
 * VGS Ebanx Credit Card Form
 * Matches the working example from VGS documentation
 * Source: BasicExample.tsx pattern
 */

import { loadVGSCollect } from '@vgs/collect-js';
import {
	VGSCollectForm,
	useVGSCollectResponse,
	useVGSCollectState,
	type VGSCollectFormState,
	type VGSCollectHttpStatusCode,
	type VGSCollectVaultEnvironment,
} from '@vgs/collect-js-react';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { useVaultId } from '../hooks/use-vault-id';

const { CardholderField, CardNumberField, CardExpirationDateField, CardSecurityCodeField } =
	VGSCollectForm;

const VGSCollectFieldStyles: Record< string, any > = {
	width: '100%',
	padding: '.5rem 1rem',
	boxSizing: 'border-box',
	fontFamily: 'inherit',
	fontSize: '16px',
	lineHeight: '1.5',
	border: '1px solid #dcdcde',
	borderRadius: '4px',
	'&::placeholder': {
		color: '#686868',
	},
	'&:focus': {
		borderColor: '#0675C4',
		outline: 'none',
		boxShadow: '0 0 0 1px #0675C4',
	},
};

interface VgsEbanxCreditCardFormProps {
	styles?: Record< string, unknown > | null;
	showFutureChargeNotice?: boolean;
}

export const VgsEbanxCreditCardForm = ( {
	styles = null,
	showFutureChargeNotice = true,
}: VgsEbanxCreditCardFormProps ) => {
	const hasRun = useRef( false );
	const [ isVGSCollectScriptLoaded, setCollectScriptLoaded ] = useState( false );

	// Vault configuration from API
	const { data: vaultConfig, isSuccess } = useVaultId();

	/**
	 * VGS Collect state hook to retrieve the form state
	 * Matches working example pattern
	 */
	const [ state ] = useVGSCollectState();

	/**
	 * VGS Collect submit hook to retrieve the form response
	 * Matches working example pattern
	 */
	const [ response ] = useVGSCollectResponse();

	/**
	 * Loading VGS Collect script and attaching it to the <head>
	 * Matches working example pattern exactly
	 */
	useEffect( () => {
		if ( ! hasRun.current && isSuccess && vaultConfig ) {
			loadVGSCollect( {
				vaultId: vaultConfig.vault_id as string,
				environment: vaultConfig.environment as VGSCollectVaultEnvironment,
				version: '3.2.2',
			} ).then( () => {
				setCollectScriptLoaded( true );
			} );
			hasRun.current = true;
		}
	}, [ isSuccess, vaultConfig ] );

	/**
	 * Log state changes for debugging
	 * Matches working example pattern
	 */
	useEffect( () => {
		console.log( 'VGS Collect state:', state );
	}, [ state ] );

	/**
	 * Log response for debugging
	 * Matches working example pattern
	 */
	useEffect( () => {
		console.log( 'VGS Collect response:', response );
	}, [ response ] );

	/**
	 * Receive information about HTTP request
	 * Matches working example pattern
	 */
	const onSubmitCallback = ( status: VGSCollectHttpStatusCode, resp: any ) => {
		console.log( 'VGS submit status:', status );
		console.log( 'VGS submit response:', resp );
	};

	/**
	 * Listen to the VGS Collect form state
	 * Matches working example pattern
	 */
	const onUpdateCallback = ( formState: VGSCollectFormState ) => {
		console.log( 'VGS form state update:', formState );
	};

	/**
	 * Receive information about Errors (client-side validation)
	 * Matches working example pattern
	 */
	const onErrorCallback = ( errors: VGSCollectFormState ) => {
		console.log( 'VGS form errors:', errors );
	};

	// Apply custom styles if provided
	const fieldStyles = styles?.input
		? {
				...VGSCollectFieldStyles,
				...styles.input,
		  }
		: VGSCollectFieldStyles;

	if ( ! isVGSCollectScriptLoaded || ! vaultConfig ) {
		return (
			<div className="vgs-ebanx-credit-card-form">
				<div className="vgs-loading">{ __( 'Loading payment form...', 'calypso' ) }</div>
			</div>
		);
	}

	return (
		<div className="vgs-ebanx-credit-card-form">
			{ /**
			 * VGS Collect form wrapper element. Abstraction over the VGSCollect.create()
			 * Matches working example pattern exactly
			 * https://www.verygoodsecurity.com/docs/api/collect/#api-vgscollectcreate
			 */ }
			<VGSCollectForm
				vaultId={ vaultConfig.vault_id as string }
				environment={ vaultConfig.environment as VGSCollectVaultEnvironment }
				action="/post"
				submitParameters={ {} }
				onUpdateCallback={ onUpdateCallback }
				onSubmitCallback={ onSubmitCallback }
				onErrorCallback={ onErrorCallback }
			>
				{ /**
				 * VGS Collect text field for cardholder name
				 * Using TextField component as in working example
				 */ }
				<CardholderField
					validations={ [ 'required' ] }
					css={ fieldStyles }
					name="card_name"
					placeholder={ __( 'Cardholder Name', 'calypso' ) }
				/>

				{ /**
				 * VGS Collect card number field component
				 * Matches working example pattern
				 * https://www.verygoodsecurity.com/docs/api/collect/#api-formfield
				 */ }
				<CardNumberField
					validations={ [ 'required', 'validCardNumber' ] }
					showCardIcon={ {
						right: '1rem',
					} }
					name="card_number"
					css={ fieldStyles }
					placeholder={ __( 'Card Number', 'calypso' ) }
				/>

				{ /**
				 * VGS Collect card expiration date field component
				 * Matches working example pattern
				 * https://www.verygoodsecurity.com/docs/api/collect/#api-formfield
				 */ }
				<CardExpirationDateField
					validations={ [ 'required', 'validCardExpirationDate' ] }
					yearLength={ 2 }
					css={ fieldStyles }
					name="card_exp"
					placeholder={ __( 'MM/YY', 'calypso' ) }
				/>

				{ /**
				 * VGS Collect card security code field component
				 * Matches working example pattern
				 * https://www.verygoodsecurity.com/docs/api/collect/#api-formfield
				 */ }
				<CardSecurityCodeField
					name="card_cvc"
					validations={ [ 'required', 'validCardSecurityCode' ] }
					css={ fieldStyles }
					showCardIcon={ {
						right: '1rem',
					} }
					placeholder={ __( 'CVC', 'calypso' ) }
				/>

				{ /* Note: Submit button will be injected by composite-checkout */ }
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
	);
};
