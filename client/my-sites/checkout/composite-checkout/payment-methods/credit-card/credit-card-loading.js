/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import Field from 'calypso/my-sites/checkout/composite-checkout/components/field';
import {
	LeftColumn,
	RightColumn,
} from 'calypso/my-sites/checkout/composite-checkout/components/ie-fallback';
import {
	GridRow,
	FieldRow,
	LabelText,
	CreditCardFieldsWrapper,
	CreditCardField,
} from './form-layout-components';
import CVVImage from './cvv-image';

export default function CreditCardLoading() {
	const { __ } = useI18n();

	return (
		<CreditCardFieldsWrapper isLoaded>
			<CreditCardField
				id="credit-card-number"
				type="Number"
				label={ __( 'Card number' ) }
				icon={ <LockIcon /> }
				isIconVisible
				autoComplete="cc-number"
				value={ '' }
				disabled
			/>
			<FieldRow gap="4%" columnWidths="48% 48%">
				<LeftColumn>
					<Field
						id="card-expiry"
						type="Number"
						label={ __( 'Expiry date' ) }
						autoComplete="cc-exp"
						value={ '' }
						disabled
					/>
				</LeftColumn>
				<RightColumn>
					<label>
						<LabelText>{ __( 'Security code' ) }</LabelText>
						<GridRow gap="4%" columnWidths="67% 29%">
							<LeftColumn>
								<Field id="card-cvc" type="Number" autoComplete="cc-csc" value={ '' } disabled />
							</LeftColumn>
							<RightColumn>
								<CVVImage />
							</RightColumn>
						</GridRow>
					</label>
				</RightColumn>
			</FieldRow>

			<CreditCardField
				id="card-holder-name"
				type="Text"
				label={ __( 'Cardholder name' ) }
				description={ __( "Enter your name as it's written on the card" ) }
				autoComplete="cc-name"
				value={ '' }
				disabled
			/>
		</CreditCardFieldsWrapper>
	);
}

function LockIcon( { className } ) {
	return (
		<LockIconGraphic
			className={ className }
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			aria-hidden="true"
			focusable="false"
		>
			<g fill="none">
				<path d="M0 0h24v24H0V0z" />
				<path opacity=".87" d="M0 0h24v24H0V0z" />
			</g>
			<path
				fill="#8E9196"
				d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
			/>
		</LockIconGraphic>
	);
}

const LockIconGraphic = styled.svg`
	width: 20px;
	height: 20px;
	display: block;
	transform: translateY( 1px );
`;
