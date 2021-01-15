/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
// import './public-path';

/**
 * Internal dependencies
 */
import WhatsNewCard from './whats-new-card';
import getWhatsNewContent from './whats-new-content';
import maximize from './icons/maximize';
import './style.scss';

/**
 * External dependencies
 */
import { Button, Flex } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { createPortal, useState, useRef } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { __ } from '@wordpress/i18n';

function LaunchWpcomWhatsNew() {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	// Preload first card image (others preloaded after NUX status confirmed)
	new window.Image().src = getWhatsNewContent()[ 0 ].imgSrc;

	return <div>{ createPortal( <WhatsNewFrame />, portalParent ) }</div>;
}

function WhatsNewFrame() {
	const cardContent = getWhatsNewContent();
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ currentCardIndex, setCurrentCardIndex ] = useState( 0 );
	const [ justMaximized, setJustMaximized ] = useState( false );

	const dismissWpcomWhatsNew = ( source ) => {
		recordTracksEvent( 'calypso_editor_whats_new_dismiss', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			slide_number: currentCardIndex + 1,
			action: source,
		} );
	};

	// Preload card images
	cardContent.forEach( ( card ) => ( new window.Image().src = card.imgSrc ) );

	return (
		<div className="wpcom-editor-whats-new-frame">
			{ ! isMinimized ? (
				<WhatsNewCard
					cardContent={ cardContent[ currentCardIndex ] }
					cardIndex={ currentCardIndex }
					justMaximized={ justMaximized }
					key={ currentCardIndex }
					lastCardIndex={ cardContent.length - 1 }
					onDismiss={ dismissWpcomWhatsNew }
					onMinimize={ setIsMinimized }
					setJustMaximized={ setJustMaximized }
					setCurrentCardIndex={ setCurrentCardIndex }
				/>
			) : (
				<WhatsNewMinimized
					onMaximize={ setIsMinimized }
					setJustMaximized={ setJustMaximized }
					slideNumber={ currentCardIndex + 1 }
				/>
			) }
		</div>
	);
}

function WhatsNewMinimized( { onMaximize, setJustMaximized, slideNumber } ) {
	const handleOnMaximize = () => {
		onMaximize( false );
		setJustMaximized( true );
		recordTracksEvent( 'calypso_editor_whats_new_maximize', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			slide_number: slideNumber,
		} );
	};

	return (
		<Button onClick={ handleOnMaximize } className="wpcom-editor-whats-new__resume-btn">
			<Flex gap={ 13 }>
				<p>{ __( 'Click to see more', 'full-site-editing' ) }</p>
				<Icon icon={ maximize } size={ 24 } />
			</Flex>
		</Button>
	);
}

export default LaunchWpcomWhatsNew;

registerPlugin( 'wpcom-block-editor-welcome-tour', {
	render: () => <LaunchWpcomWhatsNew />,
} );
