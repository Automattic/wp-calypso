/* global wpcomGlobalStyles */

import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import GlobalStylesModal from 'calypso/blocks/global-styles-modal';

const GlobalStylesSiteEditorModal = () => {
	const isVisible = useSelect(
		( select ) => select( 'automattic/wpcom-global-styles' ).isModalVisible(),
		[]
	);
	const { dismissModal } = useDispatch( 'automattic/wpcom-global-styles' );
	const { set: setPreference } = useDispatch( 'core/preferences' );

	// Hide the welcome guide modal, so it doesn't conflict with our modal.
	useEffect( () => {
		setPreference( 'core/edit-site', 'welcomeGuideStyles', false );
	}, [ setPreference ] );

	return (
		<GlobalStylesModal
			context="site-editor"
			isVisible={ isVisible }
			onClose={ dismissModal }
			upgradeUrl={ wpcomGlobalStyles.upgradeUrl }
		/>
	);
};

export default GlobalStylesSiteEditorModal;
