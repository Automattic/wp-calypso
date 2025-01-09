import BulkAllDomains from 'calypso/my-sites/domains/domain-management/list/bulk-all-domains';
import BulkSiteDomains from 'calypso/my-sites/domains/domain-management/list/bulk-site-domains';
import DomainDashboardLayout from './components/domain-dashboard-layout';
import AddDnsRecord from './dns/add-dns-record';
import DnsRecords from './dns/dns-records';
import DomainConnectMapping from './domain-connect-mapping';
import DomainOverviewPane from './domain-overview-pane';
import EditContactInfoPage from './edit-contact-info-page';
import BulkEditContactInfoPage from './edit-contact-info-page/bulk-edit-contact-info-page';
import ManageConsent from './manage-consent';
import Security from './security';
import Settings from './settings';
import SiteRedirectSettings from './site-redirect';
import TransferOut from './transfer/transfer-out';
import TransferPage from './transfer/transfer-page';
import TransferDomainToAnyUser from './transfer/transfer-to-any-user/transfer-domain-to-any-user';
import TransferDomainToOtherSite from './transfer/transfer-to-other-site/transfer-domain-to-other-site';
import TransferDomainToOtherUser from './transfer/transfer-to-other-user/transfer-domain-to-other-user';

export default {
	AddDnsRecord,
	BulkEditContactInfoPage,
	DnsRecords,
	DomainConnectMapping,
	EditContactInfoPage,
	ManageConsent,
	Security,
	Settings,
	SiteRedirectSettings,
	TransferOut,
	TransferPage,
	TransferDomainToOtherSite,
	TransferDomainToOtherUser,
	TransferDomainToAnyUser,
	BulkAllDomains,
	BulkSiteDomains,
	DomainDashboardLayout,
	DomainOverviewPane,
};
