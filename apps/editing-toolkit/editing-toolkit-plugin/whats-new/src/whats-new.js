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
import paymentsImage from './images/payments.png';
import whatsappImage from './images/whatsapp.png';
import blockPatternsImage from './images/block-patterns.png';
import dragDropImage from './images/drag-drop.png';
import singlePageSiteImage from './images/single-page-website.png';

function WhatsNewMenuItem() {
	const { toggleWhatsNew } = useDispatch( 'whats-new' );
	const isActive = useSelect( ( select ) => select( 'whats-new' ).isWhatsNewActive() );
	const whatsNewPages = getWhatsNewPages();

	// Record Tracks event if user opens What's New
	useEffect( () => {
		if ( isActive ) {
			recordTracksEvent( 'calypso_editor_whats_new_open' );
		}
	}, [ isActive ] );

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
			imgSrc: blockPatternsImage,
			heading: __( 'New Block Patterns', 'full-site-editing' ),
			description: createInterpolateElement(
				/* translators: the embed is a link */
				__(
					'<p>Easily add patterns in the editor to save time configuring and designing.</p> <p>There are hundreds of pre-made patterns for buttons, headers, galleries, and more available via the + button inserter at the top left of all pages and posts.</p> <p><Link>Learn more about block patterns</Link>.</p>',
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
			imgSrc: paymentsImage,
			heading: __( 'Use payments features to make money', 'full-site-editing' ),
			description: createInterpolateElement(
				/* translators: the embed is a link */
				__(
					'<p>You can process payments for just about anything on your website.</p><p>With the <Link1>Payments</Link1>, <Link2>Premium Content</Link2>, and <Link3>Donations blocks</Link3>, it takes just minutes to get set up to collect payments from your visitors. Available with any paid plan.</p><p><Link4>Get started with payments today</Link4>.</p>',
					'full-site-editing'
				),
				{
					Link1: (
						<a
							href="https://wordpress.com/support/wordpress-editor/blocks/payments/"
							target="_blank"
							rel="noreferrer"
						/>
					),
					Link2: (
						<a
							href="https://wordpress.com/support/wordpress-editor/blocks/premium-content-block/"
							target="_blank"
							rel="noreferrer"
						/>
					),
					Link3: (
						<a
							href="https://wordpress.com/support/wordpress-editor/blocks/donations/"
							target="_blank"
							rel="noreferrer"
						/>
					),
					Link4: <a href="http://wordpress.com/earn" target="_blank" rel="noreferrer" />,
					p: <p />,
				}
			),
		},
		{
			imgSrc: whatsappImage,
			heading: __( 'Let your visitors message you on WhatsApp', 'full-site-editing' ),
			description: createInterpolateElement(
				/* translators: the embed is a link */
				__(
					'<p>Connect and communicate with your website’s visitors with the new <Link>WhatsApp block</Link>.</p><p>With a single click, your visitors can ask questions or message you for whatever reason. Available with Premium, Business, and eCommerce plans.</p>',
					'full-site-editing'
				),
				{
					Link: (
						<a
							href="https://wordpress.com/support/wordpress-editor/blocks/whatsapp-button-block/"
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
					'<p>You can now drag and drop <Link1>Blocks</Link1>, and even <Link2>Block Patterns</Link2>, into your content directly from the Block Inserter.</p><p><Link>Learn more</Link>.</p>',
					'full-site-editing'
				),
				{
					Link1: (
						<a
							href="https://wordpress.com/support/wordpress-editor/blocks/"
							target="_blank"
							rel="noreferrer"
						/>
					),
					Link2: (
						<a
							href="https://wordpress.com/support/block-pattern/"
							target="_blank"
							rel="noreferrer"
						/>
					),
					Link3: (
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
					'<p>Sometimes you just need a single webpage to get your idea across. Introducing our freshly-launched <Link1>Blank Canvas theme</Link1>, which is optimized for single-page websites.</p><p><Link2>Learn more</Link2>.</p>',
					'full-site-editing'
				),
				{
					Link1: (
						<a href="https://wordpress.com/theme/blank-canvas" target="_blank" rel="noreferrer" />
					),
					Link2: (
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
		recordTracksEvent( 'calypso_editor_whats_new_slide_view', {
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
