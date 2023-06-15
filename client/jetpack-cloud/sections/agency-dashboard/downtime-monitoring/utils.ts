import { translate } from 'i18n-calypso';

export const getContactModalTitleAndSubTitle = {
	email: {
		add: {
			title: translate( 'Add new email address' ),
			subTitle: translate( 'Please use only your number or one you have access to.' ),
		},
		edit: {
			title: translate( 'Edit your email address' ),
			subTitle: translate( 'If you update your email address, you’ll need to verify it.' ),
		},
		remove: {
			title: translate( 'Remove Email' ),
			subTitle: translate( 'Are you sure you want to remove this email address?' ),
		},
		verify: {
			title: translate( 'Verify your email address' ),
			subTitle: translate( 'We’ll send a code to verify your email address.' ),
		},
	},
	phone: {
		add: {
			title: translate( 'Add your phone number' ),
			subTitle: translate( 'Please use an accessible phone number. Only alerts sent.' ),
		},
		edit: {
			title: translate( 'Edit your phone number' ),
			subTitle: translate( 'If you update your number, you’ll need to verify it.' ),
		},
		remove: {
			title: '',
			subTitle: '',
		},
		verify: {
			title: translate( 'Verify your phone number' ),
			subTitle: translate( 'We’ll send a code to verify your phone number.' ),
		},
	},
};
