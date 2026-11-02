import { isAutomatticianQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { DESIGN_CANDIDATES_FLAG } from 'calypso/landing/stepper/utils/build-wow';

/**
 * The query arg that turns on the design picker for an Automattician while the
 * flag is off, so the picker can be tried in production: `?design_picker=1`.
 */
export const DESIGN_PICKER_QUERY_ARG = 'design_picker';

/**
 * Whether build-wow shows the design picker and sends the pick: with the flag
 * `site-spec/design-candidates`, or when `requested` and the user is an
 * Automattician. `isLoading` is true while that check runs.
 * @param requested Whether the page asked for the picker without the flag.
 */
export function useDesignCandidatesEnabled( requested: boolean ): {
	isEnabled: boolean;
	isLoading: boolean;
} {
	const isFlagEnabled = config.isEnabled( DESIGN_CANDIDATES_FLAG );
	const checksAutomattician = requested && ! isFlagEnabled;
	const { data: isAutomattician = false, isLoading } = useQuery( {
		...isAutomatticianQuery(),
		enabled: checksAutomattician,
	} );

	return {
		isEnabled: isFlagEnabled || ( checksAutomattician && isAutomattician ),
		isLoading: checksAutomattician && isLoading,
	};
}
