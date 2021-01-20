/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { Fill, Guide, GuidePage, MenuItem } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import paymentsImage from './images/payments.png';
import whatsappImage from './images/whatsapp.png';

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
			heading: __( 'Use payments features to make money', 'full-site-editing' ),
			description: __(
				'You can process payments on your website for just about anything. With Payments, Premium Content, and Donations blocks, it takes just minutes to get setup to collect payments from your visitors. Available for with any paid plan. Get started with payments today.',
				'full-site-editing'
			),
		},
		{
			imgSrc: whatsappImage,
			heading: __( 'Let your visitors message you on WhatsApp', 'full-site-editing' ),
			description: sprintf(
				/* translators: the embed is a link */
				__(
					'Connect and communicate with your website’s visitors with the new %1$sWhatsApp block%2$s. With a single click, your website’s visitors can ask questions or message you for whatever reason. Available with Premium, Business, and eCommerce plans.',
					'full-site-editing'
				),
				"<a href='https://wordpress.com/support/wordpress-editor/blocks/whatsapp-button-block/' target='_blank' rel='noreferrer'>",
				'</a>'
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
