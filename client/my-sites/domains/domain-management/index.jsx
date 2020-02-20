/**
 * Internal dependencies
 */
import ChangeSiteAddress from './change-site-address';
import ContactsPrivacy from './contacts-privacy';
import Dns from './dns';
import DomainConnectMapping from './domain-connect-mapping';
import Edit from './edit';
import EditContactInfo from './edit-contact-info';
import List from './list';
import ManageConsent from './manage-consent';
import NameServers from './name-servers';
import PrimaryDomain from './primary-domain';
import SiteRedirect from './site-redirect';
import Transfer from './transfer';
import TransferIn from './edit/transfer-in';
import TransferOut from './transfer/transfer-out';
import TransferToOtherSite from './transfer/transfer-to-other-site';
import TransferToOtherUser from './transfer/transfer-to-other-user';
import ListAll from './list/list-all';

export default {
	ChangeSiteAddress,
	ContactsPrivacy,
	Dns,
	DomainConnectMapping,
	Edit,
	EditContactInfo,
	ManageConsent,
	List,
	ListAll,
	NameServers,
	PrimaryDomain,
	SiteRedirect,
	TransferIn,
	TransferOut,
	TransferToOtherSite,
	TransferToOtherUser,
	Transfer,
};
