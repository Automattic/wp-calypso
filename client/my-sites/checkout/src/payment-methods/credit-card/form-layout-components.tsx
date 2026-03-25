import { Field } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';

export const GridRow = styled.div< { columnWidths?: string; gap?: string } >`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: ${ ( props ) =>
		props.columnWidths?.replace( ' ', ' ' + props.gap + ' ' ) ?? 'inherit' };
	grid-template-columns: ${ ( props ) => props.columnWidths ?? 'none' };
	grid-column-gap: ${ ( props ) => props.gap ?? '4%' };
	justify-items: stretch;
`;

export const FieldRow = styled( GridRow )`
	margin-top: 16px;
`;

export const Label = styled.label`
	display: block;

	:hover {
		cursor: pointer;
	}
`;

export const LabelText = styled.span`
	display: block;
	font-size: 14px;
	font-weight: ${ ( props ) => props.theme.weights.bold };
	margin-bottom: 8px;
	color: ${ ( props ) => props.theme.colors.textColor };
`;

export const StripeFieldWrapper = styled.span< { hasError?: boolean; isDisabled?: boolean } >`
	position: relative;
	display: block;

	.StripeElement {
		display: block;
		width: 100%;
		font-size: 16px;
		box-sizing: border-box;
		border: 1px solid
			${ ( props ) =>
				props.hasError ? props.theme.colors.error : props.theme.colors.borderColor };
		border-radius: ${ ( props ) => props.theme.borderRadius.small };
		padding: 12px 14px;
		line-height: 1.2;
	}

	.StripeElement--focus {
		outline: ${ ( props ) => props.theme.colors.outline } solid 2px;
	}

	.StripeElement--focus.StripeElement--invalid {
		outline: ${ ( props ) => props.theme.colors.error } solid 2px;
	}

	background: ${ ( props ) => props.isDisabled && props.theme.colors.disabledField };
	cursor: ${ ( props ) => props.isDisabled && 'default' };
`;

const StyledStripeErrorMessage = styled.div`
	font-size: 14px;
	margin-top: 8px;
	font-style: italic;
	color: ${ ( props ) => props.theme.colors.error };
	display: block;
	font-weight: ${ ( props ) => props.theme.weights.normal };
`;

export const StripeErrorMessage = ( {
	id,
	children,
	...props
}: React.HTMLAttributes< HTMLSpanElement > ) => (
	<StyledStripeErrorMessage id={ id } aria-invalid="true" aria-live="assertive" { ...props }>
		{ children }
	</StyledStripeErrorMessage>
);

export const CreditCardFieldsWrapper = styled.div< { isLoaded?: boolean } >`
	padding: 0 24px 24px 24px;
	position: relative;
	display: ${ ( props ) => ( props.isLoaded ? 'block' : 'none' ) };
	position: relative;

	& input[type='text'],
	input[type='url'],
	input[type='password'],
	input[type='email'],
	input[type='tel'],
	input[type='number'],
	input[type='search'] {
		border-radius: ${ ( props ) => props.theme.borderRadius.small };
	}
`;

export const CreditCardField = styled( Field )`
	margin-top: 16px;
	border-radius: 3px;

	:first-of-type {
		margin-top: 0;
	}
`;
