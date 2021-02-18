/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { Fill, Guide, GuidePage, MenuItem } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
const blockPatternsImage = 'https://s0.wp.com/i/whats-new/block-patterns.png';
const dragDropImage = 'https://s0.wp.com/i/whats-new/drag-drop.png';
const singlePageSiteImage = 'https://s0.wp.com/i/whats-new/single-page-website.png';
const anchorFmImage = 'https://s0.wp.com/i/whats-new/single-page-website.png';

function WhatsNewMenuItem() {
	const { toggleWhatsNew } = useDispatch( 'automattic/whats-new' );
	const isActive = useSelect( ( select ) => select( 'automattic/whats-new' ).isWhatsNewActive() );
	const whatsNewPages = getWhatsNewPages();

	// Record Tracks event if user opens What's New
	useEffect( () => {
		if ( isActive ) {
			recordTracksEvent( 'calypso_block_editor_whats_new_open' );
		}
	}, [ isActive ] );

	return (
		<>
			<Fill name="ToolsMoreMenuGroup">
				<MenuItem onClick={ toggleWhatsNew }>{ __( "What's new", 'full-site-editing' ) }</MenuItem>
			</Fill>
			{ isActive && (
				<Guide
					className="whats-new"
					contentLabel={ __( "What's New at WordPress.com", 'full-site-editing' ) }
					finishButtonText={ __( 'Close', 'full-site-editing' ) }
					onFinish={ toggleWhatsNew }
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
			imgSrc: blockPatternsImage,
			heading: __( 'New block patterns', 'full-site-editing' ),
			description: createInterpolateElement(
				/* translators: the embed is a link */
				__(
					'<p>Choose from hundreds of pre-made patterns for buttons, headers, galleries, and more available via the + button at the top of all pages.</p><p><Link>Learn more</Link></p>',
					'full-site-editing'
				),
				{
					Link: (
						<a
							href="https://wordpress.com/support/block-pattern/"
							target="_blank"
							rel="noreferrer"
						/>
					),
					p: <p />,
				}
			),
		},
		{
			imgSrc: dragDropImage,
			heading: __( 'Drag and drop blocks and patterns in the editor', 'full-site-editing' ),
			description: createInterpolateElement(
				/* translators: the embed is a link */
				__(
					'<p>You can now drag and drop Blocks, and even Block Patterns, into your content directly from the Block Inserter.</p><p><Link>Learn more</Link></p>',
					'full-site-editing'
				),
				{
					Link: (
						<a
							href="https://make.wordpress.org/core/2021/01/08/core-editor-improvement-drag-drop-blocks-and-patterns-from-the-inserter/"
							target="_blank"
							rel="noreferrer"
						/>
					),
					p: <p />,
				}
			),
		},
		{
			imgSrc: singlePageSiteImage,
			heading: __( 'Quickly build single-page websites', 'full-site-editing' ),
			description: createInterpolateElement(
				/* translators: the embed is a link */
				__(
					'<p>Introducing our freshly-launched Blank Canvas theme, which is optimized for single-page websites.</p><p><Link>Learn more</Link></p>',
					'full-site-editing'
				),
				{
					Link: (
						<a
							href="https://wordpress.com/blog/2021/01/25/building-single-page-websites-on-wordpress-com/"
							target="_blank"
							rel="noreferrer"
						/>
					),
					p: <p />,
				}
			),
		},
		{
			imgSrc: anchorFmImage,
			heading: __( 'Create podcast episodes automatically', 'full-site-editing' ),
			description: createInterpolateElement(
				/* translators: the embed is a link */
				__(
					'<p>Instantly convert any page or post’s text into an Anchor podcast. This new text-to-speech feature automatically transforms your written words into speech – no voice recording required.</p><p><Link>Learn more</Link></p>',
					'full-site-editing'
				),
				{
					Link: (
						<a
							href="https://wordpress.com/blog/2021/01/25/building-single-page-websites-on-wordpress-com/"
							target="_blank"
							rel="noreferrer"
						/>
					),
					p: <p />,
				}
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
		recordTracksEvent( 'calypso_block_editor_whats_new_slide_view', {
			slide_number: pageNumber,
			is_last_slide: isLastPage,
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
