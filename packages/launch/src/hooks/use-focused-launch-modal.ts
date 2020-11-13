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
	isModalTitleVisible: boolean;
	showModalTitle: () => void;
	hideModalTitle: () => void;
	isFocusedLaunchOpen: boolean;
	openFocusedLaunch: () => void;
	closeFocusedLaunch: () => void;
};

export function useFocusedLaunchModal(): ReturnType {
	const isModalDismissible = useSelect( ( select ) => select( LAUNCH_STORE ).isModalDismissible() );
	const isModalTitleVisible = useSelect( ( select ) =>
		select( LAUNCH_STORE ).isModalTitleVisible()
	);

	const isFocusedLaunchOpen = useSelect( ( select ) =>
		select( LAUNCH_STORE ).isFocusedLaunchOpen()
	);

	const {
		setModalDismissible,
		unsetModalDismissible,
		showModalTitle,
		hideModalTitle,
		openFocusedLaunch,
		closeFocusedLaunch,
	} = useDispatch( LAUNCH_STORE );

	return {
		isModalDismissible,
		setModalDismissible,
		unsetModalDismissible,
		isModalTitleVisible,
		showModalTitle,
		hideModalTitle,
		isFocusedLaunchOpen,
		openFocusedLaunch,
		closeFocusedLaunch,
	};
}
