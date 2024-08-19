import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export const useIsSiteAssemblerEnabledExp = (
	source: 'design-choices' | 'design-picker' | 'theme-showcase'
) => {
	const isLoggedIn = useSelector( ( state ) => isUserLoggedIn( state ) );
	const [ isLoading, assignment ] = useExperiment( 'calypso_disable_site_assembler' );
	const variationName =
		assignment?.variationName ||
		// TODO: Remove the following one after testing.
		( typeof window !== 'undefined' &&
			window.sessionStorage.getItem( 'calypso_disable_site_assembler' ) );

	if ( isLoading ) {
		return false;
	}

	if ( variationName === 'treatment_disable_onboarding' ) {
		switch ( source ) {
			case 'theme-showcase':
				return isLoggedIn;
			case 'design-choices':
			case 'design-picker':
			default:
				return false;
		}
	}

	if ( variationName === 'treatment_disable_all' ) {
		return false;
	}

	return true;
};
