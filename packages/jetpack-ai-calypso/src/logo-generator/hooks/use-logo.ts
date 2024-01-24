/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
/**
 * Types
 */
import { UseLogoProps } from '../../types';
import type { SiteDetails } from '@automattic/data-stores';

const useLogo = ( { subject = 'World' }: UseLogoProps ) => {
	const message: string = `Hello ${ subject }`;
	const details: SiteDetails | Record< string, unknown > = {};

	const test = () => {
		recordTracksEvent( 'calypso_event_that_will_never_be_recorded', {
			foo: 'bar',
		} );
	};

	return {
		message,
		details,
		test,
	};
};

export default useLogo;
