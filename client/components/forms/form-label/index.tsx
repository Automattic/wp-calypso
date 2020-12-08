/**
 * External dependencies
 */
import React, { FunctionComponent, LabelHTMLAttributes } from 'react';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	optional?: boolean;
	required?: boolean;
}

type LabelProps = LabelHTMLAttributes< HTMLLabelElement >;

const FormLabel: FunctionComponent< Props & LabelProps > = ( {
	children,
	required,
	optional,
	className, // Via LabelProps
	...labelProps
} ) => {
	const translate = useTranslate();

	const hasChildren: boolean = React.Children.count( children ) > 0;

	return (
		<label { ...labelProps } className={ classnames( className, 'form-label' ) }>
			{ children }
			{ hasChildren && required && (
				<small className="form-label__required">{ translate( 'Required' ) }</small>
			) }
			{ hasChildren && optional && (
				<small className="form-label__optional">{ translate( 'Optional' ) }</small>
			) }
		</label>
	);
};

export default FormLabel;
