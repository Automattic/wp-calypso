import { useExperiment } from 'calypso/lib/explat';

export const useIsSiteAssemblerEnabledExp = (
	source: 'design-choices' | 'design-picker' | 'theme-showcase'
) => {
	const [ isLoading, assignment ] = useExperiment( 'calypso_disable_site_assembler' );

	if ( isLoading ) {
		return false;
	}

	if ( assignment?.variationName === 'control' ) {
		return true;
	}

	if ( assignment?.variationName === 'treatment_disable_all' ) {
		return false;
	}

	switch ( source ) {
		case 'theme-showcase':
			return true;
		case 'design-choices':
		case 'design-picker':
		default:
			return false;
	}
};
