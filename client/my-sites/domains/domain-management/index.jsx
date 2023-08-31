import AllDomains from 'calypso/my-sites/domains/domain-management/list/all-domains';
import BulkAllDomains from 'calypso/my-sites/domains/domain-management/list/bulk-all-domains';
import BulkSiteDomains from 'calypso/my-sites/domains/domain-management/list/bulk-site-domains';
import SiteDomains from 'calypso/my-sites/domains/domain-management/list/site-domains';
import ContactsPrivacy from './contacts-privacy';
import AddDnsRecord from './dns/add-dns-record';
import DnsRecords from './dns/dns-records';
import DomainConnectMapping from './domain-connect-mapping';
import EditContactInfoPage from './edit-contact-info-page';
import BulkEditContactInfoPage from './edit-contact-info-page/bulk-edit-contact-info-modal';
import ManageConsent from './manage-consent';
import Security from './security';
import Settings from './settings';
import SiteRedirectSettings from './site-redirect';
import TransferOut from './transfer/transfer-out';
import TransferPage from './transfer/transfer-page';
import TransferDomainToOtherSite from './transfer/transfer-to-other-site/transfer-domain-to-other-site';
import TransferDomainToOtherUser from './transfer/transfer-to-other-user/transfer-domain-to-other-user';

export default {
	AddDnsRecord,
	BulkEditContactInfoPage,
	ContactsPrivacy,
	DnsRecords,
	DomainConnectMapping,
	EditContactInfoPage,
	ManageConsent,
	AllDomains,
	SiteDomains,
	Security,
	Settings,
	SiteRedirectSettings,
	TransferOut,
	TransferPage,
	TransferDomainToOtherSite,
	TransferDomainToOtherUser,
	BulkAllDomains,
	BulkSiteDomains,
};
