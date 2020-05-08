/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Guide, GuidePage } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import './style.scss';
import blockImage from './images/block.svg';
import blockPickerImage from './images/block-picker.svg';
import editorImage from './images/editor.svg';
import previewImage from './images/preview.svg';
import privateImage from './images/private.svg';

function WpcomNux() {
	const { isWpcomNuxEnabled, isSPTOpen } = useSelect( ( select ) => ( {
		isWpcomNuxEnabled: select( 'automattic/nux' ).isWpcomNuxEnabled(),
		isSPTOpen:
			select( 'automattic/starter-page-layouts' ) && // Handle the case where SPT is not initalized.
			select( 'automattic/starter-page-layouts' ).isOpen(),
	} ) );

	const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );

	// On mount check if the WPCOM NUX status exists in state, otherwise fetch it from the API.
	useEffect( () => {
		if ( typeof isWpcomNuxEnabled !== 'undefined' ) {
			return;
		}
		const fetchWpcomNuxStatus = async () => {
			const response = await apiFetch( { path: '/wpcom/v2/block-editor/nux' } );
			setWpcomNuxStatus( { isNuxEnabled: response.is_nux_enabled, bypassApi: true } );
		};
		fetchWpcomNuxStatus();
	}, [ isWpcomNuxEnabled, setWpcomNuxStatus ] );

	if ( ! isWpcomNuxEnabled || isSPTOpen ) {
		return null;
	}

	const dismissWpcomNux = () => setWpcomNuxStatus( { isNuxEnabled: false } );

	/* @TODO: the copy, images, and slides will eventually be the same for all sites. `isGutenboarding` is only needed right now to serve copy that hasn't been translated before initial launch */
	const isGutenboarding = !! window.calypsoifyGutenberg?.isGutenboarding;

	return (
		<Guide
			className="wpcom-block-editor-nux"
			contentLabel={ __( 'Welcome to your website' ) }
			finishButtonText={ __( 'Get started' ) }
			onFinish={ dismissWpcomNux }
		>
			{ getWpcomNuxPages( isGutenboarding ).map( ( nuxPage, index ) => (
				<NuxPage key={ index } { ...nuxPage } />
			) ) }
		</Guide>
	);
}

/**
 * @param   { boolean } isGutenboarding Whether the flow is Gutenboarding or not
 * @returns { Array }                   a collection of <NuxPage /> props filtered by whether the flow is Gutenboarding or not
 */
function getWpcomNuxPages( isGutenboarding ) {
	return [
		{
			heading: __( 'Welcome to your website' ),
			description: __(
				'Edit your homepage, add the pages you need, and change your site’s look and feel.'
			),
			imgSrc: editorImage,
			alignBottom: true,
			shouldRender: true,
		},
		{
			heading: __( 'Create pages and add your content' ),
			description: __(
				'Create and rearrange your site pages. Customize your site navigation menus so your visitors can explore your site.'
			),
			imgSrc: blockImage,
			shouldRender: ! isGutenboarding,
		},
		{
			heading: isGutenboarding ? __( 'Add or edit your content' ) : __( 'Add (almost) anything' ),
			description: isGutenboarding
				? __(
						'Edit the placeholder content we’ve started you off with, or click the plus sign to add more content.'
				  )
				: __(
						'Insert text, photos, forms, Yelp reviews, testimonials, maps, and more. Rearrange the blocks on your page until they’re just right.'
				  ),
			imgSrc: blockPickerImage,
			shouldRender: true,
		},
		{
			heading: __( 'Preview your site as you go' ),
			description: __(
				'As you edit your site content, click “Preview” to see your site the way your visitors will.'
			),
			imgSrc: previewImage,
			shouldRender: isGutenboarding,
			alignBottom: true,
		},
		{
			heading: isGutenboarding
				? __( 'Private until you’re ready' )
				: __( "Private until you're ready to launch" ),
			description: isGutenboarding
				? __(
						'Your site will remain private as you make changes until you’re ready to launch and share with the world.'
				  )
				: __(
						"Your site remains private until you're ready to launch. Take your time and make as many changes as you need until it's ready to share with the world."
				  ),
			imgSrc: privateImage,
			shouldRender: isGutenboarding,
			alignBottom: true,
		},
	].filter( ( nuxPage ) => nuxPage.shouldRender );
}

function NuxPage( { alignBottom = false, heading, description, imgSrc } ) {
	return (
		<GuidePage className="wpcom-block-editor-nux__page">
			<div className="wpcom-block-editor-nux__text">
				<h1 className="wpcom-block-editor-nux__heading">{ heading }</h1>
				<div className="wpcom-block-editor-nux__description">{ description }</div>
			</div>
			<div className="wpcom-block-editor-nux__visual">
				<img
					// Force remount so the stale image doesn't remain while new image is fetched
					key={ imgSrc }
					src={ imgSrc }
					alt=""
					aria-hidden="true"
					className={ 'wpcom-block-editor-nux__image' + ( alignBottom ? ' align-bottom' : '' ) }
				/>
			</div>
		</GuidePage>
	);
}

// Only register plugin if these features are available.
// If registered without this check, atomic sites without gutenberg enabled will error when loading the editor.
// These seem to be the only dependencies here that are not supported there.
if ( Guide && GuidePage ) {
	registerPlugin( 'wpcom-block-editor-nux', {
		render: () => <WpcomNux />,
	} );
}
