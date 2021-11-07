import classnames from 'classnames';

const FormLegend = ( { className, children, ...otherProps } ) => (
	<legend { ...otherProps } className={ classnames( className, 'form-legend' ) }>
		{ children }
	</legend>
);

export default FormLegend;
