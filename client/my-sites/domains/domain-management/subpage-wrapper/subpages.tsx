import { translate } from 'i18n-calypso';
import { CardHeading } from 'calypso/devdocs/design/component-examples';
import AddForwardingEmailHeader from './headers/add-fowarding-email-header';
import { CustomHeaderComponentType } from './headers/custom-header-component-type';

type SubpageWrapperParamsType = {
	CustomHeader?: CustomHeaderComponentType;
	title?: string | React.ReactNode;
	subtitle?: string | React.ReactNode;
	[ key: string ]: unknown;
};

// Subpage keys
export const ADD_FOWARDING_EMAIL = 'add-forwarding-email';
export const EDIT_CONTACT_INFO = 'edit-contact-info';

// Subpage params map
const SUBPAGE_TO_PARAMS_MAP: Record< string, SubpageWrapperParamsType > = {
	[ ADD_FOWARDING_EMAIL ]: {
		CustomHeader: AddForwardingEmailHeader,
		showFormHeader: true,
		showPageHeader: false,
		formHeader: <CardHeading>{ translate( 'New email forwarding address' ) }</CardHeading>,
	},
	[ EDIT_CONTACT_INFO ]: {
		subPageKey: EDIT_CONTACT_INFO,
		title: translate( 'Contact information' ),
		subtitle: translate( "Manage your domain's contact details." ),
	},
};

export const getSubpageParams = ( subPageKey: string ): SubpageWrapperParamsType => {
	return SUBPAGE_TO_PARAMS_MAP[ subPageKey ];
};
