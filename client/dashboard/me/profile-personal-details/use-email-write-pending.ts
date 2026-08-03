import { emailWriteFilters } from '@automattic/api-queries';
import { useIsMutating } from '@tanstack/react-query';

/**
 * Whether any write that can change the email address is in flight, wherever it was started.
 *
 * The controls that issue them are spread across the verification banner and the email field, and
 * none of them can see the others' state. A resend queued behind a cancellation would re-save the
 * address that was just cancelled, so a control that can't tell whether one is running has no way
 * to keep the reader from asking for both.
 */
export function useIsEmailWritePending() {
	return useIsMutating( emailWriteFilters ) > 0;
}
