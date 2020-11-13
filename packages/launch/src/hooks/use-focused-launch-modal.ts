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
	setModalDismissible: () => void;
	unsetModalDismissible: () => void;
};

export function useFocusedLaunchModal(): ReturnType {
	const isModalDismissible = useSelect( ( select ) => select( LAUNCH_STORE ).isModalDismissible() );

	const { setModalDismissible, unsetModalDismissible } = useDispatch( LAUNCH_STORE );

	return {
		isModalDismissible,
		setModalDismissible,
		unsetModalDismissible,
	};
}
