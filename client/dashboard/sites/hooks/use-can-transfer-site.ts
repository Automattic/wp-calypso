import { useAuth } from '../../app/auth';
import type { Site } from '../../data/types';

export function useCanTransferSite( { site }: { site?: Site } ) {
	const { user } = useAuth();

	// TODO: The following types of the site are not allowed to transfer the ownership:
	// * NonAtomicJetpackSite
	// * P2 Hub
	// * WP For Teams
	// * VIP Site
	// * Staging site
	// We may need to handle this via endpoint somewhere. See canCurrentUserStartSiteOwnerTransfer.
	return site?.site_owner === user.ID;
}
