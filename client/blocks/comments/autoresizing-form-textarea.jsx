import clsx from 'clsx';
import { forwardRef } from 'react';
import withUserMentions from 'calypso/blocks/user-mentions/index';
import AutoDirection from 'calypso/components/auto-direction';
import FormTextarea from 'calypso/components/forms/form-textarea';
import withPasteToLink from 'calypso/lib/paste-to-link';

import './autoresizing-form-textarea.scss';

const AutoresizingFormTextarea = (
	{
		hasFocus,
		value,
		placeholder,
		onKeyUp,
		onKeyDown,
		onFocus,
		onBlur,
		onChange,
		enableAutoFocus,
		...otherProps
	},
	forwardedRef
) => {
	const classes = clsx( 'expanding-area', { focused: hasFocus } );

	return (
		<div className={ classes }>
			<pre>
				<span>{ value }</span>
				<br />
			</pre>
			<AutoDirection>
				<FormTextarea
					{ ...otherProps }
					value={ value }
					placeholder={ placeholder }
					onKeyUp={ onKeyUp }
					onKeyDown={ onKeyDown }
					onFocus={ onFocus }
					onBlur={ onBlur }
					onChange={ onChange }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus={ enableAutoFocus }
					forwardedRef={ forwardedRef }
				/>
			</AutoDirection>
		</div>
	);
};

export const ForwardedAutoresizingFormTextarea = forwardRef( AutoresizingFormTextarea );

export default withPasteToLink( withUserMentions( ForwardedAutoresizingFormTextarea ) );
