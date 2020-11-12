/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * Internal dependencies
 */
import './style-tour.scss';
import editorImage from './images/editor.svg';

/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';

function WpcomNuxTour() {
	const [ isOpen, setIsOpen ] = useState( true );
	const [ isMinimized, setIsMinimized ] = useState( false );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			title="Spike modal with background interaction /& minimization"
			className="wpcom-block-editor-nux-tour"
			onRequestClose={ () => setIsOpen( false ) }
			shouldCloseOnClickOutside={ false }
			shouldCloseOnEsc={ false }
		>
			{ ! isMinimized ? (
				<div>
					<p> The content is viewable & component is in Maximized State </p>
					<Button isPrimary={ true } onClick={ () => setIsMinimized( true ) }>
						Minimize Me
					</Button>
				</div>
			) : (
				<div>
					<p> Content box is in minimized State</p>
					<Button onClick={ () => setIsMinimized( false ) }>Expand Me</Button>
				</div>
			) }
		</Modal>
	);
}

registerPlugin( 'wpcom-block-editor-nux', {
	render: () => <WpcomNuxTour />,
} );

export default WpcomNuxTour;
