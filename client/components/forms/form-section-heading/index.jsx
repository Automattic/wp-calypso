import classnames from 'classnames';

import './style.scss';
/**
 * Render a form section heading
 *
 * @param {Object} props Component props
 * @param {string=} props.className optional extra CSS class(es) to be added to the component
 * @param {import('react').ReactChild=} props.children react element props that must contain some children
 * @param {Object=} props.otherProps react element props that must contain some children
 * @returns {import('react').ReactElement} React component
 */
const FormSectionHeading = ( { className, children, ...otherProps } ) => (
	<h3 { ...otherProps } className={ classnames( className, 'form-section-heading' ) }>
		{ children }
	</h3>
);

export default FormSectionHeading;
