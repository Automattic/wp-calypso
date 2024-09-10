import { ReactNode, Ref, FC } from 'react';

export interface FormTextInputWithActionProps {
	className?: string;
	clearOnSubmit?: boolean;
	action?: ReactNode;
	inputRef?: Ref< HTMLElement >;
	onFocus?: () => void;
	onBlur?: () => void;
	onKeyDown?: () => void;
	onChange?: ( param: string ) => void;
	onAction?: ( param: string ) => void;
	defaultValue?: string;
	disabled?: boolean;
	isError?: boolean;
	isValid?: boolean;
	placeholder?: string;
}

declare const FormTextInputWithAction: FC< FormTextInputWithActionProps >;
export default FormTextInputWithAction;
