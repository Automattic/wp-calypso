import { HelpCenter as HelpCenterStore } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { help } from '@wordpress/icons';
import { useCallback } from 'react';
import type { HelpCenterButtonProps } from './types';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenterStore.register();

const HelpCenterButton = ( { className }: HelpCenterButtonProps ) => {
	const show = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );

	const toggleHelpCenter = useCallback( () => {
		setShowHelpCenter( ! show );
	}, [ show, setShowHelpCenter ] );

	return (
		<Button
			className={ className }
			label={ __( 'Help' ) }
			onClick={ toggleHelpCenter }
			icon={ help }
			variant="tertiary"
		/>
	);
};

export default HelpCenterButton;
