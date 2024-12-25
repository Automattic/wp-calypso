import { __ } from '@wordpress/i18n';
import AddForwardingEmailHeader from './headers/add-fowarding-email-header';
import { CustomHeaderComponentType } from './headers/custom-header-component-type';
import DNSRecordsHeader, {
	dnsRecordsTitle,
	dnsRecordsSubtitle,
} from './headers/dns-records-header';

type SubpageWrapperParamsType = {
	CustomHeader?: CustomHeaderComponentType;
	title?: string | React.ReactNode;
	subtitle?: string | React.ReactNode;
	[ key: string ]: unknown;
};

// Subpage keys
export const ADD_FOWARDING_EMAIL = 'add-forwarding-email';
export const DNS_RECORDS = 'dns-records';
export const ADD_DNS_RECORD = 'add-dns-record';
export const EDIT_CONTACT_INFO = 'edit-contact-info';

// Subpage params map
const SUBPAGE_TO_PARAMS_MAP: Record< string, SubpageWrapperParamsType > = {
	[ ADD_FOWARDING_EMAIL ]: {
		CustomHeader: AddForwardingEmailHeader,
		showFormHeader: true,
		showPageHeader: false,
	},
	[ DNS_RECORDS ]: {
		CustomHeader: DNSRecordsHeader,
		titleOverride: dnsRecordsTitle,
		subtitleOverride: dnsRecordsSubtitle,
		showBreadcrumb: false,
		showDetails: false,
	},
	[ EDIT_CONTACT_INFO ]: {
		subPageKey: EDIT_CONTACT_INFO,
		title: __( 'Contact information' ),
		subtitle: __( "Manage your domain's contact details." ),
	},
	[ ADD_DNS_RECORD ]: {
		subPageKey: ADD_DNS_RECORD,
		title: __( 'Add a new DNS record' ),
		subtitle: __( 'DNS records change how your domain works.' ),
		showBreadcrumbs: false,
	},
};

export const getSubpageParams = ( subPageKey: string ): SubpageWrapperParamsType => {
	return SUBPAGE_TO_PARAMS_MAP[ subPageKey ];
};
