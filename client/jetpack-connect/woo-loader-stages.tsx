import { __ } from '@wordpress/i18n';
import WooPurpleHeart from 'calypso/assets/images/onboarding/woo-purple-heart.png';
import OpeningImage from './woo-loader-stage-images/OpeningImage';
import SetupImage from './woo-loader-stage-images/SetupImage';

export const ConnectingYourAccountStage = {
	title: __( 'Connecting your account' ),
	image: SetupImage,
	label: __( '#FunWooFact:' ),
	text: __(
		'There are more than 150 WooCommerce meetups held all over the world! A great way to meet fellow store owners.'
	),
	duration: 8000,
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

export const OpeningTheDoorsStage = {
	title: __( 'Opening the doors' ),
	image: OpeningImage,
	label: __( '#FunWooFact:' ),
	text: __( 'Our favorite color is purple' ),
	element: <img src={ WooPurpleHeart } alt="loader-hearticon" className="loader-hearticon" />,
	duration: 30000,
	progress: 100,
};
