import { translate } from 'i18n-calypso';
import { type } from 'calypso/lib/domains/constants';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import {
	domainManagementEdit,
	domainManagementSiteRedirect,
	domainManagementTransferIn,
} from 'calypso/my-sites/domains/paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export const getDomainManagementPath = ( domainName, domainType, siteSlug, currentRoute ) => {
	switch ( domainType ) {
		case type.TRANSFER:
			return domainManagementTransferIn( siteSlug, domainName, currentRoute );

		case type.SITE_REDIRECT:
			return domainManagementSiteRedirect( siteSlug, domainName, currentRoute );

		default:
			return domainManagementEdit( siteSlug, domainName, currentRoute );
	}
};

export const ListAllActions = {
	editContactInfo: 'edit-contact-info',
	editContactEmail: 'edit-contact-email',
};

export const showUpdatePrimaryDomainSuccessNotice = ( domainName ) => {
	reduxDispatch(
		successNotice(
			translate(
				'Primary domain changed: all domains will redirect to {{em}}%(domainName)s{{/em}}.',
				{ args: { domainName }, components: { em: <em /> } }
			),
			{ duration: 10000, isPersistent: true }
		)
	);
};

export const showUpdatePrimaryDomainErrorNotice = ( errorMessage ) => {
	reduxDispatch(
		errorNotice(
			errorMessage ||
				translate( "Something went wrong and we couldn't change your primary domain." ),
			{ duration: 10000, isPersistent: true }
		)
	);
};

export const filterOutWpcomDomains = ( domains ) => {
	return domains.filter( ( domain ) => domain.type !== type.WPCOM );
};
