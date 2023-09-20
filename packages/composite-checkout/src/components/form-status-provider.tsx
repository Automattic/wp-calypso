import { useMemo } from 'react';
import { FormStatusContext } from '../lib/form-status-context';
import type { FormStatusManager } from '../types';
import type { ReactNode } from 'react';

/**
 * This component provides the context necessary to render a
 * `CheckoutStepGroup` form and/or other forms that want to use the same
 * active/busy state.
 *
 * The required `formStatusManager` prop can be created by calling the
 * `useFormStatusManager` hook.
 *
 * This provider supplies a form status state that can be accessed with
 * `useFormStatus` and will always be in one of the following states:
 *
 * - `FormStatus.LOADING`
 * - `FormStatus.READY`
 * - `FormStatus.VALIDATING`
 * - `FormStatus.SUBMITTING`
 * - `FormStatus.COMPLETE`
 *
 * You can change the current form status by using the `setFormStatus` function
 * returned by the `useFormStatus` hook.
 *
 * You may wrap several `CheckoutStepGroup` instances inside this provider if
 * they want them to share the same form status.
 */
export function FormStatusProvider( {
	formStatusManager,
	children,
}: {
	formStatusManager: FormStatusManager;
	children: ReactNode;
} ) {
	const value: FormStatusManager = useMemo( () => formStatusManager, [ formStatusManager ] );
	return <FormStatusContext.Provider value={ value }>{ children }</FormStatusContext.Provider>;
}
