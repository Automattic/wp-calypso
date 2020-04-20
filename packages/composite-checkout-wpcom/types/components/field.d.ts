declare function Field( {
	type,
	id,
	className,
	isError,
	onChange,
	label,
	value,
	icon,
	iconAction,
	isIconVisible,
	placeholder,
	tabIndex,
	description,
	errorMessage,
	autoComplete,
	disabled,
}: {
	type: any;
	id: any;
	className: any;
	isError: any;
	onChange: any;
	label: any;
	value: any;
	icon: any;
	iconAction: any;
	isIconVisible: any;
	placeholder: any;
	tabIndex: any;
	description: any;
	errorMessage: any;
	autoComplete: any;
	disabled: any;
} ): JSX.Element;
declare namespace Field {
	export const propTypes: {
		type: PropTypes.Requireable< string >;
		id: PropTypes.Validator< string >;
		className: PropTypes.Requireable< string >;
		isError: PropTypes.Requireable< boolean >;
		onChange: PropTypes.Requireable< ( ...args: any[] ) => any >;
		label: PropTypes.Requireable< string >;
		value: PropTypes.Requireable< string >;
		icon: PropTypes.Requireable< PropTypes.ReactNodeLike >;
		iconAction: PropTypes.Requireable< ( ...args: any[] ) => any >;
		isIconVisible: PropTypes.Requireable< boolean >;
		placeholder: PropTypes.Requireable< string >;
		tabIndex: PropTypes.Requireable< string >;
		description: PropTypes.Requireable< string >;
		errorMessage: PropTypes.Requireable< string >;
		autoComplete: PropTypes.Requireable< string >;
		disabled: PropTypes.Requireable< boolean >;
	};
}
export default Field;
import PropTypes from 'prop-types';
