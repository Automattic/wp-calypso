/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import LaunchModal from '../launch-modal';
import './styles.scss';

const LaunchButton: React.FunctionComponent = () => {
	const [ isLaunchModalVisible, setLaunchModalVisibility ] = React.useState( false );

	const handleClick = () => {
		setLaunchModalVisibility( ! isLaunchModalVisible );
	};

	const handleModalClose = () => {
		setLaunchModalVisibility( false );
	};

	return (
		<>
			<Button
				aria-expanded={ isLaunchModalVisible }
				aria-pressed={ isLaunchModalVisible }
				aria-haspopup="menu"
				onClick={ handleClick }
			>
				{ __( 'Launch site', 'full-site-editing' ) }
			</Button>
			{ isLaunchModalVisible && <LaunchModal onClose={ handleModalClose } /> }
		</>
	);
};

export default LaunchButton;
