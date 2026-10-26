import { useState } from '@wordpress/element';
import clsx from 'clsx';
import { useInteractiveUiSurface } from '../contexts/surface';

/**
 * The props every input shares: its surface's disabled state, and the message of its first failed
 * check (in the agent's order), once the field is touched or the person activates a Button whose
 * checks fail, so a new form doesn't open with errors. Call `touch` when the person leaves a
 * text or date field, or changes a check box, a choice or a slider: Safari doesn't focus
 * checkboxes, radios and sliders on click, so they may never blur.
 */
export function useFieldProps( validationErrors: string[] = [] ) {
	const [ isTouched, setIsTouched ] = useState( false );
	const { disabled, isShowingErrors } = useInteractiveUiSurface();
	const error = isTouched || isShowingErrors ? ( validationErrors[ 0 ] ?? '' ) : '';

	return {
		fieldProps: {
			className: clsx( { 'ai-ui-renderer__field--error': error } ),
			description: error,
			'aria-invalid': !! error,
			disabled,
		},
		touch: () => setIsTouched( true ),
	};
}
