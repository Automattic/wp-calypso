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
	isFocusedLaunchOpen: boolean;
	openFocusedLaunch: () => void;
	closeFocusedLaunch: () => void;
};

export function useFocusedLaunchModal(): ReturnType {
	const isModalDismissible = useSelect( ( select ) => select( LAUNCH_STORE ).isModalDismissible() );

	const isFocusedLaunchOpen = useSelect( ( select ) =>
		select( LAUNCH_STORE ).isFocusedLaunchOpen()
	);

	const {
		setModalDismissible,
		unsetModalDismissible,
		openFocusedLaunch,
		closeFocusedLaunch,
	} = useDispatch( LAUNCH_STORE );

	return {
		isModalDismissible,
		setModalDismissible,
		unsetModalDismissible,
		isFocusedLaunchOpen,
		openFocusedLaunch,
		closeFocusedLaunch,
	};
}
