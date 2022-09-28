import { useI18n } from '@wordpress/react-i18n';

export function useVideoPressLoadingMessages() {
	const { __ } = useI18n();
	return [
		{ title: __( 'Setting up your video site' ), duration: 5000 },
		{ title: __( 'Scouting the locations' ), duration: 5000 },
		{ title: __( 'Kicking off the casting' ), duration: 5000 },
		{ title: __( "Let's head to the checkout" ), duration: 5000 },
	];
}
