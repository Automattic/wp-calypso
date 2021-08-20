import page from 'page';
import { domainManagementTransferInPrecheck } from 'calypso/my-sites/domains/paths';

export const transferDomainAction = ( { domain, selectedSite, transferDomainUrl } ) => {
	const defaultTransferUrl =
		domainManagementTransferInPrecheck( selectedSite.slug, domain ) + '?goBack=use-my-domain';
	const transferUrl = transferDomainUrl ?? defaultTransferUrl;

	page( transferUrl );
};
