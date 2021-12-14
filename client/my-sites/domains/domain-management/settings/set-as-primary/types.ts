import {
	showUpdatePrimaryDomainSuccessNotice,
	showUpdatePrimaryDomainErrorNotice,
} from 'calypso/state/domains/management/actions';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

export type SetAsPrimaryPassedProps = {
	domain: ResponseDomain;
	selectedSite: SiteData;
};

export type SetAsPrimaryStateProps = {
	canSetPrimaryDomain: boolean;
	hasNonPrimaryDomainsFlag: boolean;
	hasDomainOnlySite: boolean;
	isOnFreePlan: boolean;
	isManagingAllSites: boolean;
};

export type ChangePrimaryFunctionSignature = ( domain: ResponseDomain, mode: string ) => void;

export type SetAsPrimaryDispatchProps = {
	setPrimaryDomain: typeof setPrimaryDomain;
	showUpdatePrimaryDomainErrorNotice: ReturnType< typeof showUpdatePrimaryDomainErrorNotice >;
	showUpdatePrimaryDomainSuccessNotice: ReturnType< typeof showUpdatePrimaryDomainSuccessNotice >;
	changePrimary: ChangePrimaryFunctionSignature;
};

export type SetAsPrimaryProps = SetAsPrimaryPassedProps &
	SetAsPrimaryStateProps &
	SetAsPrimaryDispatchProps;
