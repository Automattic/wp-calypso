import styled from '@emotion/styled';
import { TranslateResult } from 'i18n-calypso';
import type { FunctionComponent } from 'react';

type FormFieldWrapperProps = {
	isError: boolean;
	theme?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const FormFieldWrapper = styled.div< FormFieldWrapperProps >`
	select {
		width: 100%;
		font-size: 14px;
	}
`;

type LabelProps = {
	isDisabled: boolean;
	theme?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const Label = styled.label< LabelProps >`
	display: block;
	color: ${ ( props ) => props.theme.colors.textColor };
	font-weight: ${ ( props ) => props.theme.weights.bold };
	font-size: 14px;
	margin-bottom: 8px;

	:hover {
		cursor: ${ ( props ) => ( props.isDisabled ? 'default' : 'pointer' ) };
	}
`;

const Description = styled.p< DescriptionProps >`
	margin: 8px 0 0;
	color: ${ ( props ) =>
		props.isError ? props.theme.colors.error : props.theme.colors.textColorLight };
	font-style: italic;
	font-size: 14px;
`;

/**
 * Annotate a form field element with a label, description, and an optional
 * colored error border with error text.
 *
 * If you pass a labelText, you should also pass labelId and formFieldId
 * for accessibility purposes. formFieldId must be the id attribute of the
 * child component, of which there should be exactly one.
 */
type FormFieldAnnotationProps = {
	// Semantic props
	labelText: string;
	normalDescription?: string;
	errorDescription?: TranslateResult;

	// Functional props
	isError?: boolean; // default false
	isDisabled?: boolean; // default false

	// Technical props
	className?: string;
	labelId: string;
	descriptionId: string;
	formFieldId: string;
	children?: React.ReactNode;
};

const FormFieldAnnotation: FunctionComponent< FormFieldAnnotationProps > = ( {
	formFieldId,
	labelText,
	labelId,
	normalDescription,
	descriptionId,
	errorDescription,
	isError,
	isDisabled,
	className,
	children,
} ) => {
	const isErrorWithDefault: boolean = isError === undefined ? false : isError;
	const isDisabledWithDefault: boolean = isDisabled === undefined ? false : isDisabled;

	return (
		<div className={ className }>
			<Label htmlFor={ formFieldId } id={ labelId } isDisabled={ isDisabledWithDefault }>
				{ labelText }
			</Label>
			<FormFieldWrapper data-testid={ `${ className }_wrapper` } isError={ isErrorWithDefault }>
				{ children }
			</FormFieldWrapper>
			<RenderedDescription
				descriptionText={ normalDescription }
				descriptionId={ descriptionId }
				isError={ isError }
				errorMessage={ errorDescription }
			/>
		</div>
	);
};

function RenderedDescription( {
	descriptionText,
	descriptionId,
	isError,
	errorMessage,
}: RenderedDescriptionProps ) {
	if ( descriptionText || isError ) {
		return (
			<Description isError={ isError } id={ descriptionId }>
				{ isError ? errorMessage : descriptionText }
			</Description>
		);
	}
	return null;
}

type RenderedDescriptionProps = {
	descriptionText?: string;
	descriptionId?: string;
	isError?: boolean;
	errorMessage?: TranslateResult;
};

type DescriptionProps = {
	isError?: boolean;
	theme?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export default FormFieldAnnotation;
