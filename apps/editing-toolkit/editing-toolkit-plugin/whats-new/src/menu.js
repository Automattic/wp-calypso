/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { Fill, MenuItem, Guide, GuidePage } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
const paymentsImage = 'https://s0.wp.com/i/whats-new/payments.png';
const whatsappImage = 'https://s0.wp.com/i/whats-new/whatsapp.png';
// import paymentsImage from './images/payments.png';
// import whatsappImage from './images/whatsapp.png';
// import WhatsNew from './whats-new-launch'

function WhatsNewMenuItem() {
	const { toggleWhatsNew } = useDispatch( 'whats-new' );
	const isActive = useSelect( ( select ) => select( 'whats-new' ).isWhatsNewActive() );
	const whatsNewPages = getWhatsNewPages();

	return (
		<>
			<Fill name="ToolsMoreMenuGroup">
				<MenuItem onClick={ () => toggleWhatsNew() }>
					{ __( "What's New", 'full-site-editing' ) }
				</MenuItem>
			</Fill>
			{ isActive && (
				<Guide
					className="whats-new"
					contentLabel={ __( "What's New at WordPress.com", 'full-site-editing' ) }
					finishButtonText={ __( 'Close', 'full-site-editing' ) }
					onFinish={ () => toggleWhatsNew() }
				>
					{ whatsNewPages.map( ( page, index ) => (
						<WhatsNewPage
							key={ page.heading }
							pageNumber={ index + 1 }
							isLastPage={ index === whatsNewPages.length - 1 }
							{ ...page }
						/>
					) ) }
				</Guide>
			) }
		</>
	);
}

function getWhatsNewPages() {
	return [
		{
			imgSrc: paymentsImage,
			heading: __( 'Welcome to the block editor', 'full-site-editing' ),
			description: __(
				'In the WordPress editor, each paragraph, image, or video is presented as a distinct “block” of content.',
				'full-site-editing'
			),
		},
		{
			imgSrc: whatsappImage,
			heading: __( 'Make each block your own', 'full-site-editing' ),
			description: __(
				'Each block comes with its own set of controls for changing things like color, width, and alignment. These will show and hide automatically when you have a block selected.',
				'full-site-editing'
			),
		},
	];
}

function WhatsNewPage( {
	pageNumber,
	isLastPage,
	alignBottom = false,
	heading,
	description,
	imgSrc,
} ) {
	useEffect( () => {
		recordTracksEvent( 'calypso_editor_wpcom_nux_slide_view', {
			slide_number: pageNumber,
			is_last_slide: isLastPage,
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
	return (
		<GuidePage className="whats-new__page">
			<div className="whats-new__text">
				<h1 className="whats-new__heading">{ heading }</h1>
				<div className="whats-new__description">{ description }</div>
			</div>
			<div className="whats-new__visual">
				<img
					// Force remount so the stale image doesn't remain while new image is fetched
					key={ imgSrc }
					src={ imgSrc }
					alt=""
					aria-hidden="true"
					className={ 'whats-new__image' + ( alignBottom ? ' align-bottom' : '' ) }
				/>
			</div>
		</GuidePage>
	);
}

export default WhatsNewMenuItem;

registerPlugin( 'whats-new', {
	render() {
		return <WhatsNewMenuItem />;
	},
} );
