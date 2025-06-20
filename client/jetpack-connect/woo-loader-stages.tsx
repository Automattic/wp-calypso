import { __ } from '@wordpress/i18n';
import SetupImage from './woo-loader-stage-images/SetupImage';

export const ConnectingYourAccountStage = {
	title: __( 'Connecting your account' ),
	image: SetupImage,
	label: __( '#FunWooFact:' ),
	text: __(
		'There are more than 150 WooCommerce meetups held all over the world! A great way to meet fellow store owners.'
	),
	duration: 10000,
	progress: 70,
};

export const CreatingYourAccountStage = {
	title: __( 'Creating your account' ),
	image: SetupImage,
	label: __( '#FunWooFact:' ),
	text: __(
		'There are more than 150 WooCommerce meetups held all over the world! A great way to meet fellow store owners.'
	),
	duration: 10000,
	progress: 70,
};

// This is a placeholder stage that is used so the progress bar can reach 100%
export const PlaceholderStage = {
	title: __( 'Connecting your account' ),
	image: SetupImage,
	label: __( '#FunWooFact:' ),
	text: __(
		'There are more than 150 WooCommerce meetups held all over the world! A great way to meet fellow store owners.'
	),
	duration: 30000,
	progress: 100,
};
