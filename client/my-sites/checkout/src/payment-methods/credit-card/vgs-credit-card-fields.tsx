/**
 * VGS Credit Card Fields Component
 * Integrated VGS form for EBANX credit card payments
 * Matches existing credit card field styling exactly
 */

import { loadVGSCollect, VGS } from '@vgs/collect-js';
import {
	VGSCollectForm,
	useVGSCollectFormInstance,
	type VGSCollectVaultEnvironment,
} from '@vgs/collect-js-react';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { useVaultId } from '../../hooks/use-vault-id';

const { CardNumberField, CardExpirationDateField, CardSecurityCodeField } = VGSCollectForm;

// Match existing credit card field styling exactly with proper height and spacing
// Include error states for validation feedback
const VGSCollectFieldStyles: VGS.Css = {
	width: '100%',
	height: '40px',
	padding: '0.5rem 1rem',
	boxSizing: 'border-box',
	fontFamily: 'inherit',
	fontSize: '16px',
	fontWeight: '400',
	lineHeight: '1.5',
	border: '1px solid #c3c4c7',
	borderRadius: '2px',
	display: 'flex',
	alignItems: 'center',
	'&::placeholder': {
		color: '#686868',
		opacity: '1',
	},
	'&:focus': {
		borderColor: '#3858e9',
		outline: 'none',
		boxShadow: '0 0 0 1px #3858e9',
	},
	'&:focus::placeholder': {
		color: '#c3c4c7',
	},
	// Show error state when field is invalid and touched
	'&.invalid.touched:not(:focus)': {
		borderColor: '#d63638',
		boxShadow: '0 0 0 1px #d63638',
	},
	// Show error state when field is invalid (even if not touched) after form submission attempt
	'&.invalid:not(:focus)': {
		borderColor: '#d63638',
		boxShadow: '0 0 0 1px #d63638',
	},
};

interface VgsCreditCardFieldsStyles {
	container?: React.CSSProperties;
	fieldWrapper?: React.CSSProperties;
	label?: React.CSSProperties;
	input?: VGS.Css;
	futureChargeNotice?: React.CSSProperties;
}

interface VgsCreditCardFieldsProps {
	styles?: VgsCreditCardFieldsStyles;
	showFutureChargeNotice?: boolean;
	onVgsFormError?: ( error: string | null ) => void;
	formSubmitAttempted?: boolean;
	labels?: {
		cardNumber?: string;
		expiryDate?: string;
		cvc?: string;
		futureChargeNotice?: string;
	};
	placeholders?: {
		cardNumber?: string;
		expiryDate?: string;
		cvc?: string;
	};
	descriptions?: {
		cardNumber?: string;
		expiryDate?: string;
		cvc?: string;
	};
	fieldSpacing?: string;
}

/**
 * Get localized error message for a VGS field
 */
function getVgsFieldErrorMessage( field: VGS.FieldState | undefined ): string | null {
	if ( ! field || ! field.errors || field.errors.length === 0 ) {
		return null;
	}

	const error = field.errors[ 0 ];
	const errorCode = error.code || 0;

	if ( field.name === 'card_number' || field.name === 'card-number' ) {
		switch ( errorCode ) {
			case 1001:
				return __( 'Card number is required.', 'calypso' );
			case 1011:
				return __( 'Card number is invalid.', 'calypso' );
		}
	} else if ( field.name === 'card_exp' || field.name === 'card-expiration-date' ) {
		switch ( errorCode ) {
			case 1001:
				return __( 'Expiration date is required.', 'calypso' );
			case 1015:
				return __( 'Expiration date is invalid.', 'calypso' );
		}
	} else if ( field.name === 'card_cvc' || field.name === 'card-security-code' ) {
		switch ( errorCode ) {
			case 1001:
				return __( 'Security code is required.', 'calypso' );
			case 1017:
				return __( 'Security code is invalid.', 'calypso' );
		}
	}

	return error.message || __( 'Please check this field.', 'calypso' );
}

/**
 * Check if a field should display an error message
 */
function shouldDisplayFieldError(
	field: VGS.FieldState | undefined,
	formSubmitAttempted: boolean
): boolean {
	if ( ! field ) {
		return false;
	}

	// Show error if field is invalid and (touched or form submission was attempted)
	return ! field.isValid && ( field.isTouched || formSubmitAttempted );
}

export const VgsCreditCardFields = ( {
	styles = {},
	showFutureChargeNotice = false,
	onVgsFormError,
	formSubmitAttempted: formSubmitAttemptedProp = false,
	labels = {},
	placeholders = {},
	descriptions = {},
	fieldSpacing = '1rem',
}: VgsCreditCardFieldsProps ) => {
	const hasRun = useRef( false );
	const [ isVGSCollectScriptLoaded, setCollectScriptLoaded ] = useState( false );
	const [ initializationError, setInitializationError ] = useState< string | null >( null );
	const [ formSubmitAttempted, setFormSubmitAttempted ] = useState( false );
	const { data: vaultConfig, isSuccess, error: vaultError } = useVaultId();
	const [ form ] = useVGSCollectFormInstance();

	// Update formSubmitAttempted when prop changes
	useEffect( () => {
		if ( formSubmitAttemptedProp ) {
			setFormSubmitAttempted( true );
		}
	}, [ formSubmitAttemptedProp ] );

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

	// Default styles with ability to override
	const defaultLabelStyle: React.CSSProperties = {
		display: 'block',
		marginBottom: '0.5rem',
		fontSize: '14px',
		fontWeight: 500,
		color: '#50575e',
		...styles?.label,
	};

	const defaultDescriptionStyle: React.CSSProperties = {
		display: 'block',
		marginTop: '0.5rem',
		fontSize: '14px',
		fontStyle: 'italic',
		color: '#646970',
		lineHeight: '1.4',
	};

	const defaultFieldWrapperStyle: React.CSSProperties = {
		marginBottom: fieldSpacing,
		...styles?.fieldWrapper,
	};

	const fieldStyles = styles?.input
		? {
				...VGSCollectFieldStyles,
				...styles.input,
		  }
		: VGSCollectFieldStyles;

	// Expiry and CVC are always on the same line since they're short fields
	const expirySecurityContainerStyle: React.CSSProperties = {
		display: 'flex',
		gap: fieldSpacing,
		marginBottom: fieldSpacing,
	};

	const expirySecurityFieldStyle: React.CSSProperties = { flex: '1' };

	// Get form state to check field validation
	const formData = form?.state || {};
	const cardNumberField = formData[ 'card_number' ] || formData[ 'card-number' ];
	const cardExpField = formData[ 'card_exp' ] || formData[ 'card-expiration-date' ];
	const cardCvcField = formData[ 'card_cvc' ] || formData[ 'card-security-code' ];

	// Show error state - this will trigger fallback to existing form
	if ( initializationError ) {
		// Log error but don't show to user - fallback will handle it
		onVgsFormError?.( initializationError );
		return null;
	}

	// Show loading state
	if ( ! isVGSCollectScriptLoaded || ! vaultConfig ) {
		return (
			<div className="vgs-credit-card-fields" style={ styles?.container }>
				<div className="vgs-loading" style={ { padding: '1rem', textAlign: 'center' } }>
					{ __( 'Loading payment form', 'calypso' ) + '...' }
				</div>
			</div>
		);
	}

	return (
		<div className="vgs-credit-card-fields" style={ styles?.container }>
			<VGSCollectForm
				vaultId={ vaultConfig.vault_id as string }
				environment={ vaultConfig.environment as VGSCollectVaultEnvironment }
			>
				<div className="vgs-field-wrapper" style={ defaultFieldWrapperStyle }>
					<label htmlFor="card_number" style={ defaultLabelStyle }>
						{ labels.cardNumber || '' }
					</label>
					<CardNumberField
						validations={ [ 'required', 'validCardNumber' ] }
						showCardIcon={ false }
						name="card_number"
						css={ fieldStyles }
						placeholder={ placeholders.cardNumber || '' }
					/>
					{ shouldDisplayFieldError( cardNumberField, formSubmitAttempted ) && (
						<div
							className="vgs-field-error"
							role="alert"
							style={ {
								color: '#d63638',
								fontSize: '14px',
								marginTop: '0.25rem',
							} }
						>
							{ getVgsFieldErrorMessage( cardNumberField ) }
						</div>
					) }
					{ descriptions.cardNumber && (
						<span style={ defaultDescriptionStyle }>{ descriptions.cardNumber }</span>
					) }
				</div>

				<div style={ expirySecurityContainerStyle }>
					<div className="vgs-field-wrapper" style={ expirySecurityFieldStyle }>
						<label htmlFor="card_exp" style={ defaultLabelStyle }>
							{ labels.expiryDate || '' }
						</label>
						<CardExpirationDateField
							validations={ [ 'required', 'validCardExpirationDate' ] }
							yearLength={ 2 }
							css={ fieldStyles }
							name="card_exp"
							placeholder={ placeholders.expiryDate || '' }
							// This serializer converts MM/YY to MM/YYYY
							serializers={ [
								{ name: 'replace', options: { old: '(\\d{2}) \\/ (\\d{2})', new: '$1/20$2' } },
							] }
						/>
						{ shouldDisplayFieldError( cardExpField, formSubmitAttempted ) && (
							<div
								className="vgs-field-error"
								role="alert"
								style={ {
									color: '#d63638',
									fontSize: '14px',
									marginTop: '0.25rem',
								} }
							>
								{ getVgsFieldErrorMessage( cardExpField ) }
							</div>
						) }
						{ descriptions.expiryDate && (
							<span style={ defaultDescriptionStyle }>{ descriptions.expiryDate }</span>
						) }
					</div>

					<div className="vgs-field-wrapper" style={ expirySecurityFieldStyle }>
						<label htmlFor="card_cvc" style={ defaultLabelStyle }>
							{ labels.cvc || '' }
						</label>
						<CardSecurityCodeField
							name="card_cvc"
							validations={ [ 'required', 'validCardSecurityCode' ] }
							css={ fieldStyles }
							placeholder={ placeholders.cvc || '' }
						/>
						{ shouldDisplayFieldError( cardCvcField, formSubmitAttempted ) && (
							<div
								className="vgs-field-error"
								role="alert"
								style={ {
									color: '#d63638',
									fontSize: '14px',
									marginTop: '0.25rem',
								} }
							>
								{ getVgsFieldErrorMessage( cardCvcField ) }
							</div>
						) }
						{ descriptions.cvc && (
							<span style={ defaultDescriptionStyle }>{ descriptions.cvc }</span>
						) }
					</div>
				</div>
			</VGSCollectForm>

			{ showFutureChargeNotice && labels.futureChargeNotice && (
				<span
					className="future-use-text"
					data-testid="future-use-text"
					style={ {
						display: 'block',
						marginTop: fieldSpacing,
						fontSize: '14px',
						color: '#646970',
						...styles?.futureChargeNotice,
					} }
				>
					{ labels.futureChargeNotice }
				</span>
			) }
		</div>
	);
};
