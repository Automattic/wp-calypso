declare function RadioButton( {
	checked,
	name,
	value,
	onChange,
	children,
	label,
	id,
	ariaLabel,
}: {
	checked: any;
	name: any;
	value: any;
	onChange: any;
	children: any;
	label: any;
	id: any;
	ariaLabel: any;
} ): JSX.Element;
declare namespace RadioButton {
	export namespace propTypes {
		export const name: PropTypes.Validator< string >;
		export const id: PropTypes.Validator< string >;
		export const label: PropTypes.Validator<
			string | number | boolean | {} | PropTypes.ReactElementLike | PropTypes.ReactNodeArray
		>;
		export const checked: PropTypes.Requireable< boolean >;
		export const value: PropTypes.Validator< string >;
		export const onChange: PropTypes.Requireable< ( ...args: any[] ) => any >;
		export const ariaLabel: PropTypes.Validator< string >;
	}
}
export default RadioButton;
import PropTypes from 'prop-types';
