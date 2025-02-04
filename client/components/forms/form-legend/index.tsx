import clsx from 'clsx';
import * as React from 'react';

type FormLegendProps = {
	className?: string;
	children: React.ReactNode;
} & React.HTMLAttributes< HTMLLegendElement >;

const FormLegend = ( { className, children, ...otherProps }: FormLegendProps ) => (
	<legend { ...otherProps } className={ clsx( className, 'form-legend' ) }>
		{ children }
	</legend>
);

export default FormLegend;
