import { isSiteSetupFlow, isFreeFlow } from '@automattic/onboarding';
import { useQuery } from '../../../../../hooks/use-query';

const useIsNewSite = ( flow: string ) => {
	// New sites are created from:
	// - 'free' flow
	// - 'site-setup' flow
	// - 'with-theme-assembler' from LoTS, which has isNewSite: true
	return !! useQuery().get( 'isNewSite' ) || isFreeFlow( flow ) || isSiteSetupFlow( flow );
};

export default useIsNewSite;
