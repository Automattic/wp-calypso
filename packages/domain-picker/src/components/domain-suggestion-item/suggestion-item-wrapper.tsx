/**
 * External dependencies
 */
import * as React from 'react';

/**
 * Internal dependencies
 */
import { SUGGESTION_ITEM_TYPE_BUTTON } from './suggestion-item';

import type { SUGGESTION_ITEM_TYPE } from './suggestion-item';

// to avoid nesting buttons, wrap the item with a div instead of button in button mode
// (button mode means there is a Select button, not the whole item being a button)

interface WrappingComponentAdditionalProps {
	type: SUGGESTION_ITEM_TYPE;
	disabled?: boolean;
}
type WrappingComponentProps = WrappingComponentAdditionalProps &
	( React.HTMLAttributes< HTMLDivElement > | React.ButtonHTMLAttributes< HTMLButtonElement > );

const WrappingComponent = React.forwardRef< HTMLButtonElement, WrappingComponentProps >(
	( { type, disabled, ...props }, ref ) => {
		if ( type === SUGGESTION_ITEM_TYPE_BUTTON ) {
			return <div { ...( props as React.HTMLAttributes< HTMLDivElement > ) } />;
		}
		return (
			<button
				ref={ ref }
				disabled={ disabled }
				{ ...( props as React.ButtonHTMLAttributes< HTMLButtonElement > ) }
			/>
		);
	}
);

export default WrappingComponent;
