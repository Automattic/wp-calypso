import { isSiteSetupFlow } from '@automattic/onboarding';
import { useQuery } from '../../../../../hooks/use-query';

const useIsNewSite = ( flow: string ) => {
	// New sites are created from:
	// - 'site-setup' flow
	// - 'with-theme-assembler' from LoTS, which has isNewSite: true
	return !! useQuery().get( 'isNewSite' ) || isSiteSetupFlow( flow );
};

export default useIsNewSite;
