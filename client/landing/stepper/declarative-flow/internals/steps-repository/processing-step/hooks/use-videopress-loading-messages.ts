import { useI18n } from '@wordpress/react-i18n';
import type { LoadingMessage } from './types';

export function useVideoPressLoadingMessages(): LoadingMessage[] {
	const { __ } = useI18n();
	return [
		{ title: __( 'Setting up your video site' ), duration: 5000 },
		{ title: __( 'Scouting the locations' ), duration: 5000 },
		{ title: __( 'Kicking off the casting' ), duration: 5000 },
		{ title: __( "Let's head to the checkout" ), duration: 5000 },
	];
}
