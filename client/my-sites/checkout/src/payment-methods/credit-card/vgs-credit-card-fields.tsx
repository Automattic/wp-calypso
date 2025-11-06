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
	labels?: {
		cardholderName?: string;
		cardNumber?: string;
		expiryDate?: string;
		cvc?: string;
		futureChargeNotice?: string;
	};
	placeholders?: {
		cardholderName?: string;
		cardNumber?: string;
		expiryDate?: string;
		cvc?: string;
	};
	descriptions?: {
		cardholderName?: string;
		cardNumber?: string;
		expiryDate?: string;
		cvc?: string;
	};
	fieldSpacing?: string;
}

export const VgsCreditCardFields = ( {
	styles = {},
	showFutureChargeNotice = false,
	onVgsFormError,
	labels = {},
	placeholders = {},
	descriptions = {},
	fieldSpacing = '1rem',
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
					<label htmlFor="card_holder" style={ defaultLabelStyle }>
						{ labels.cardholderName || '' }
					</label>
					<CardholderField
						validations={ [ 'required' ] }
						css={ fieldStyles }
						name="card_holder"
						placeholder={ placeholders.cardholderName || '' }
					/>
					{ descriptions.cardholderName && (
						<span style={ defaultDescriptionStyle }>{ descriptions.cardholderName }</span>
					) }
				</div>

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
						/>
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
