import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Children, FunctionComponent, LabelHTMLAttributes, forwardRef } from 'react';

import './style.scss';

export interface Props {
	optional?: boolean;
	required?: boolean;
}

type LabelProps = LabelHTMLAttributes< HTMLLabelElement >;

const FormLabel: FunctionComponent< Props & LabelProps > = forwardRef<
	HTMLLabelElement,
	Props & LabelProps
>(
	(
		{
			children,
			required,
			optional,
			className, // Via LabelProps
			...labelProps
		},
		ref
	) => {
		const translate = useTranslate();

		const hasChildren: boolean = Children.count( children ) > 0;

		return (
			<label ref={ ref } { ...labelProps } className={ classnames( className, 'form-label' ) }>
				{ children }
				{ hasChildren && required && (
					<small className="form-label__required">{ translate( 'Required' ) }</small>
				) }
				{ hasChildren && optional && (
					<small className="form-label__optional">{ translate( 'Optional' ) }</small>
				) }
			</label>
		);
	}
);

export default FormLabel;
