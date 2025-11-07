/**
 * VGS Credit Card Fields Component
 * Integrated VGS form for EBANX credit card payments
 * Matches existing credit card field styling exactly
 */

import { loadVGSCollect, VGS } from '@vgs/collect-js';
import { VGSCollectForm, type VGSCollectVaultEnvironment } from '@vgs/collect-js-react';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { useVaultId } from '../../hooks/use-vault-id';

const { CardholderField, CardNumberField, CardExpirationDateField, CardSecurityCodeField } =
	VGSCollectForm;

// Match existing credit card field styling exactly with proper height and spacing
const VGSCollectFieldStyles: VGS.Css = {
	width: '100%',
	height: '40px',
	padding: '0.5rem 1rem',
	boxSizing: 'border-box',
	fontFamily: 'inherit',
	fontSize: '16px',
	lineHeight: '1.5',
	border: '1px solid #dcdcde',
	borderRadius: '4px',
	display: 'flex',
	alignItems: 'center',
	'&::placeholder': {
		color: '#686868',
		opacity: '1',
	},
	'&:focus': {
		borderColor: '#0675C4',
		outline: 'none',
		boxShadow: '0 0 0 1px #0675C4',
	},
	'&:focus::placeholder': {
		color: '#c3c4c7',
	},
};

interface VgsCreditCardFieldsProps {
	styles?: Record< string, unknown > | null;
	showFutureChargeNotice?: boolean;
	onVgsFormError?: ( error: string | null ) => void;
}

export const VgsCreditCardFields = ( {
	styles = null,
	showFutureChargeNotice = true,
	onVgsFormError,
}: VgsCreditCardFieldsProps ) => {
	const hasRun = useRef( false );
	const [ isVGSCollectScriptLoaded, setCollectScriptLoaded ] = useState( false );
	const [ initializationError, setInitializationError ] = useState< string | null >( null );
	const { data: vaultConfig, isSuccess, error: vaultError } = useVaultId();

	// Enhanced VGS Collect script loading with better error handling
	useEffect( () => {
		if ( ! hasRun.current && isSuccess && vaultConfig ) {
			loadVGSCollect( {
				vaultId: vaultConfig.vault_id as string,
				environment: vaultConfig.environment as VGSCollectVaultEnvironment,
				version: '3.2.2',
			} )
				.then( () => {
					setCollectScriptLoaded( true );
					setInitializationError( null );
				} )
				.catch( () => {
					const errorMessage = __(
						'Failed to load payment form. Please refresh the page.',
						'calypso'
					);
					setInitializationError( errorMessage );
					onVgsFormError?.( errorMessage );
				} );
			hasRun.current = true;
		}
	}, [ isSuccess, vaultConfig, onVgsFormError ] );

	// Handle vault configuration errors
	useEffect( () => {
		if ( vaultError ) {
			const errorMessage = __(
				'Failed to load payment configuration. Please try again.',
				'calypso'
			);
			setInitializationError( errorMessage );
			onVgsFormError?.( errorMessage );
		}
	}, [ vaultError, onVgsFormError ] );

	// Apply custom styles if provided
	const fieldStyles = styles?.input
		? {
				...VGSCollectFieldStyles,
				...styles.input,
		  }
		: VGSCollectFieldStyles;

	// Show error state - this will trigger fallback to existing form
	if ( initializationError ) {
		// Log error but don't show to user - fallback will handle it
		onVgsFormError?.( initializationError );
		return null;
	}

	// Show loading state
	if ( ! isVGSCollectScriptLoaded || ! vaultConfig ) {
		return (
			<div className="vgs-credit-card-fields">
				<div className="vgs-loading" style={ { padding: '1rem', textAlign: 'center' } }>
					{ __( 'Loading payment form', 'calypso' ) + '...' }
				</div>
			</div>
		);
	}

	return (
		<div className="vgs-credit-card-fields">
			<VGSCollectForm
				vaultId={ vaultConfig.vault_id as string }
				environment={ vaultConfig.environment as VGSCollectVaultEnvironment }
			>
				<div className="vgs-field-wrapper" style={ { marginBottom: '1rem' } }>
					<label
						htmlFor="card_holder"
						style={ {
							display: 'block',
							marginBottom: '0.5rem',
							fontSize: '14px',
							fontWeight: 500,
							color: '#1e1e1e',
						} }
					>
						{ __( 'Cardholder name', 'calypso' ) }
					</label>
					<CardholderField
						validations={ [ 'required' ] }
						css={ fieldStyles }
						name="card_holder"
						placeholder={ __( "Enter your name as it's written on the card", 'calypso' ) }
					/>
				</div>

				<div className="vgs-field-wrapper" style={ { marginBottom: '1rem' } }>
					<label
						htmlFor="card_number"
						style={ {
							display: 'block',
							marginBottom: '0.5rem',
							fontSize: '14px',
							fontWeight: 500,
							color: '#1e1e1e',
						} }
					>
						{ __( 'Card number', 'calypso' ) }
					</label>
					<CardNumberField
						validations={ [ 'required', 'validCardNumber' ] }
						showCardIcon={ {
							right: '1rem',
						} }
						name="card_number"
						css={ fieldStyles }
						placeholder={ __( '1234 5678 9012 3456', 'calypso' ) }
					/>
				</div>

				<div style={ { display: 'flex', gap: '1rem', marginBottom: '1rem' } }>
					<div className="vgs-field-wrapper" style={ { flex: '1' } }>
						<label
							htmlFor="card_exp"
							style={ {
								display: 'block',
								marginBottom: '0.5rem',
								fontSize: '14px',
								fontWeight: 500,
								color: '#1e1e1e',
							} }
						>
							{ __( 'Expiry date', 'calypso' ) }
						</label>
						<CardExpirationDateField
							validations={ [ 'required', 'validCardExpirationDate' ] }
							yearLength={ 2 }
							css={ fieldStyles }
							name="card_exp"
							placeholder={ __( 'MM/YY', 'calypso' ) }
						/>
					</div>

					<div className="vgs-field-wrapper" style={ { flex: '1' } }>
						<label
							htmlFor="card_cvc"
							style={ {
								display: 'block',
								marginBottom: '0.5rem',
								fontSize: '14px',
								fontWeight: 500,
								color: '#1e1e1e',
							} }
						>
							{ __( 'CVC', 'calypso' ) }
						</label>
						<CardSecurityCodeField
							name="card_cvc"
							validations={ [ 'required', 'validCardSecurityCode' ] }
							css={ fieldStyles }
							showCardIcon={ {
								right: '1rem',
							} }
							placeholder={ __( '123', 'calypso' ) }
						/>
					</div>
				</div>
			</VGSCollectForm>

			{ showFutureChargeNotice && (
				<span
					className="future-use-text"
					data-testid="future-use-text"
					style={ {
						display: 'block',
						marginTop: '1rem',
						fontSize: '14px',
						color: '#646970',
					} }
				>
					{ __(
						'By providing your card information, you allow your card be charged for future payments.',
						'calypso'
					) }
				</span>
			) }
		</div>
	);
};
