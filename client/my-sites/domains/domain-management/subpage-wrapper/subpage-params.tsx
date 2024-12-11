import { __ } from '@wordpress/i18n';
import CardHeading from 'calypso/components/card-heading';

export const ADD_FOWARDING_EMAIL = 'add-forwarding-email';

type SubPageWrapperParamsType = {
	subPageKey: string;
	title: string;
	subtitle?: string;
	[ key: string ]: unknown;
};

const SUBPAGE_TO_PARAMS_MAP: Record< string, SubPageWrapperParamsType > = {
	[ ADD_FOWARDING_EMAIL ]: {
		subPageKey: ADD_FOWARDING_EMAIL,
		title: __( 'Add new email forwarding' ),
		subtitle: __( 'Seamlessly redirect your messages to where you need them.' ),
		showPageHeader: false,
		formHeader: <CardHeading>{ __( 'New email forwarding address' ) }</CardHeading>,
	},
};

export const getSubPageParams = ( subPageKey: string ): SubPageWrapperParamsType => {
	return SUBPAGE_TO_PARAMS_MAP[ subPageKey ];
};
