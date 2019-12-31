/**
 * External dependencies
 */
import React, { Component, FunctionComponent } from 'react';
import styled from '@emotion/styled';

type FormFieldAnnotationProps = {
	formField: Component;

	// Semantic props
	labelText: string;
	descriptionText: string;
	errorMessage: string;

	// Functional props
	isError: boolean;
	isDisabled: boolean;

	// Technical props
	className?: string;
	labelId: string;
	descriptionId: string;
};

export const FormFieldAnnotation: FunctionComponent< FormFieldAnnotationProps > = ( {
	formField,
	labelText,
	labelId,
	descriptionText,
	descriptionId,
	errorMessage,
	isError,
	isDisabled,
	className,
} ) => (
	<div className={ className }>
		{ labelText && (
			<Label id={ labelId } isDisabled={ isDisabled }>
				{ labelText }
			</Label>
		) }
		<FormFieldWrapper isError={ isError }>{ formField }</FormFieldWrapper>
		<RenderedDescription
			descriptionText={ descriptionText }
			descriptionId={ descriptionId }
			isError={ isError }
			errorMessage={ errorMessage }
		/>
	</div>
);

type LabelProps = {
	isDisabled: boolean;
	theme?: any;
};

const Label = styled.label< LabelProps >`
	display: block;
	color: ${props => props.theme.colors.textColor};
	font-weight: ${props => props.theme.weights.bold};
	font-size: 14px;
	margin-bottom: 8px;

	:hover {
		cursor: ${props => ( props.isDisabled ? 'default' : 'pointer' )};
	}
`;

type FormFieldWrapperProps = {
	isError: boolean;
	theme?: any;
};

const FormFieldWrapper = styled.div< FormFieldWrapperProps >`
	display: block;
	width: 100%;
	box-sizing: border-box;
	font-size: 16px;
	border: 1px solid
		${props => ( props.isError ? props.theme.colors.error : props.theme.colors.borderColor )};

	:focus {
		outline: ${props => ( props.isError ? props.theme.colors.error : props.theme.colors.outline )}
			solid 2px !important;
	}

	::-webkit-inner-spin-button,
	::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}
`;

function RenderedDescription( { descriptionText, descriptionId, isError, errorMessage } ) {
	if ( descriptionText || isError ) {
		return (
			<Description isError={ isError } id={ descriptionId }>
				{ isError ? errorMessage : descriptionText }
			</Description>
		);
	}
	return null;
}

type DescriptionProps = {
	isError: boolean;
	theme?: any;
};

const Description = styled.p< DescriptionProps >`
	margin: 8px 0 0 0;
	color: ${props =>
		props.isError ? props.theme.colors.error : props.theme.colors.textColorLight};
	font-style: italic;
	font-size: 14px;
`;
