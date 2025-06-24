import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Children, forwardRef } from 'react';

import './style.scss';

type FormLabelProps = {
	optional?: boolean;
	required?: boolean;
	hasCoreStyles?: boolean;
	hasCoreStylesNoCaps?: boolean;
} & JSX.IntrinsicElements[ 'label' ];

const FormLabel = forwardRef< HTMLLabelElement, FormLabelProps >(
	(
		{ children, required, optional, className, hasCoreStyles, hasCoreStylesNoCaps, ...labelProps },
		ref
	) => {
		const translate = useTranslate();
		const hasChildren: boolean = Children.count( children ) > 0;

		return (
			<label
				{ ...labelProps }
				className={ clsx( className, 'form-label', {
					'form-label-core-styles': hasCoreStyles || hasCoreStylesNoCaps,
					'form-label-core-styles-no-caps': hasCoreStylesNoCaps,
				} ) }
				ref={ ref }
			>
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

FormLabel.displayName = 'FormLabel';

export default FormLabel;
