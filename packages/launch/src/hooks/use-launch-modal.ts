/**
 * External dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * External dependencies
 */
import { LAUNCH_STORE } from '../stores';

type ReturnType = {
	isModalDismissible: boolean;
	setModalDismissible: ( isDismissible: boolean ) => void;
};

export function useLaunchModal(): ReturnType {
	const isModalDismissible = useSelect( ( select ) => select( LAUNCH_STORE ).isModalDismissible() );
	const setModalDismissible = useDispatch( LAUNCH_STORE ).setModalDismissible;

	return {
		isModalDismissible,
		setModalDismissible,
	};
}
