import React from 'react';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { requestSites } from 'calypso/state/sites/actions';
import { IAppState } from 'calypso/state/types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { LocalizeProps } from 'i18n-calypso';

type Maybe< T > = T | null;
// TODO: remove this once the checkout types are further described
type SiteDataExtraInfo = SiteDetails & {
	options: {
		is_automated_transfer: boolean;
		is_domain_only: boolean;
	};
	title: string;
	capabilities?: Record< string, boolean >;
};

// props passed to the component
export type TransferDomainToOtherSitePassedProps = {
	domains: ResponseDomain[];
	isRequestingSiteDomains: boolean;
	selectedDomainName: string;
	selectedSite: SiteDataExtraInfo;
	children?: React.ReactNode;
	context?: {
		params?: { [ key: string ]: any };
	};
};

// state props
export type TransferDomainToOtherSiteStateProps = {
	aftermarketAuction: boolean;
	currentRoute: string;
	currentUserCanManage: boolean;
	domain?: ResponseDomain;
	hasSiteDomainsLoaded: boolean;
	isDomainOnly: Maybe< boolean >;
	isMapping: boolean;
	sites: SiteDetails[];
	showHeader?: boolean;
};
// state props added by redux connect
export type TransferDomainToOtherSiteStateToProps = (
	state: IAppState,
	ownProps: TransferDomainToOtherSitePassedProps
) => TransferDomainToOtherSiteStateProps;

// all component props (passed + redux state props)
export type TransferDomainToOtherSiteProps = TransferDomainToOtherSitePassedProps &
	TransferDomainToOtherSiteStateProps &
	TransferDomainToOtherSiteDispatchToProps &
	LocalizeProps;

export type TransferDomainToOtherSiteDispatchToProps = {
	requestSites: typeof requestSites;
	errorNotice: typeof errorNotice;
	successNotice: typeof successNotice;
};
