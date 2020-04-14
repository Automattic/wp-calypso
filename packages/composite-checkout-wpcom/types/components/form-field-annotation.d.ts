/**
 * External dependencies
 */
import { FunctionComponent } from 'react';
/**
 * Annotate a form field element with a label, description, and an optional
 * colored error border with error text.
 *
 * If you pass a labelText, you should also pass labelId and formFieldId
 * for accessibility purposes. formFieldId must be the id attribute of the
 * child component, of which there should be exactly one.
 */
declare type FormFieldAnnotationProps = {
	labelText: string;
	normalDescription?: string;
	errorDescription: string;
	isError?: boolean;
	isDisabled?: boolean;
	className?: string;
	labelId: string;
	descriptionId: string;
	formFieldId: string;
};
declare const FormFieldAnnotation: FunctionComponent< FormFieldAnnotationProps >;
export default FormFieldAnnotation;
