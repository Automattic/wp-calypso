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
import { Guide } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';

function WpcomNuxTour() {
	const [ isOpen, setIsOpen ] = useState( true );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Guide
			className="wpcom-block-editor-nux-tour"
			onFinish={ () => setIsOpen( false ) }
			pages={ [
				{
					content: <p>Welcome to the NUX Tour !</p>,
				},
				{
					imageSrc: editorImage,
					content: <p>This is page #2.</p>,
				},
			] }
		/>
	);
}

export default WpcomNuxTour;
