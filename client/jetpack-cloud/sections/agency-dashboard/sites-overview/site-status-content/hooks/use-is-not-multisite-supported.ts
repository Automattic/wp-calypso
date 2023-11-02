import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import { AllowedTypes, Site } from '../../types';

// determine if current column type is not supported on multisite
const useIsNotMultisiteSupported = ( site: Site, type: AllowedTypes ): boolean => {
	const isMultiSite = useSelector( ( state ) => !! isJetpackSiteMultiSite( state, site.blog_id ) );

	return useMemo( () => {
		return isMultiSite && ( type === 'scan' || ( type === 'backup' && ! site.has_backup ) );
	}, [ isMultiSite, site.has_backup, type ] );
};

export default useIsNotMultisiteSupported;
