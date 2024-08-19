import { useExperiment } from 'calypso/lib/explat';

export const useIsSiteAssemblerEnabledExp = (
	source: 'design-choices' | 'design-picker' | 'theme-showcase'
) => {
	const [ isLoading, assignment ] = useExperiment( 'calypso_disable_site_assembler' );
	const variationName =
		assignment?.variationName ||
		// TODO: Remove the following one after testing.
		window.sessionStorage.getItem( 'calypso_disable_site_assembler' );

	if ( isLoading ) {
		return false;
	}

	if ( variationName === 'treatment_disable_onboarding' ) {
		switch ( source ) {
			case 'theme-showcase':
				return true;
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
