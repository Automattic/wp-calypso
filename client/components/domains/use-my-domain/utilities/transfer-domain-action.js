import page from 'page';
import { domainTransferIn } from 'calypso/my-sites/domains/paths';

export const transferDomainAction = ( { domain, selectedSite, transferDomainUrl } ) => {
	// TODO: This will be replaced with a new transfer in flow in a near-term future update.
	const defaultTransferUrl = domainTransferIn( selectedSite.slug, domain, true );
	const transferUrl = transferDomainUrl ?? defaultTransferUrl;
	page( transferUrl );
};
