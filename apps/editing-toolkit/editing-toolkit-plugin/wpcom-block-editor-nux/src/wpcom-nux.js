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

	const { closeGeneralSidebar } = useDispatch( 'core/edit-post' );
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

	// Hide editor sidebar first time users sees the editor
	useEffect( () => {
		isWpcomNuxEnabled && closeGeneralSidebar();
	}, [ closeGeneralSidebar, isWpcomNuxEnabled ] );

	if ( ! isWpcomNuxEnabled || isSPTOpen ) {
		return null;
	}

	const dismissWpcomNux = () => setWpcomNuxStatus( { isNuxEnabled: false } );

	/* @TODO: the copy, images, and slides will eventually be the same for all sites. `isGutenboarding` is only needed right now to show the Privacy slide */
	const isGutenboarding = !! window.calypsoifyGutenberg?.isGutenboarding;

	return (
		<Guide
			className="wpcom-block-editor-nux"
			contentLabel={ __( 'Welcome to your website', 'full-site-editing' ) }
			finishButtonText={ __( 'Get started', 'full-site-editing' ) }
			onFinish={ dismissWpcomNux }
		>
			{ getWpcomNuxPages( isGutenboarding ).map( ( nuxPage ) => (
				<NuxPage key={ nuxPage.heading } { ...nuxPage } />
			) ) }
		</Guide>
	);
}

/**
 * This function returns a filtered collection of NUX slide data
 * Function arguments can be extended to customize the slides for specific environments, e.g., Gutenboarding
 *
 * @param   { boolean } isGutenboarding Whether the flow is Gutenboarding or not
 * @returns { Array }                   a collection of <NuxPage /> props filtered by whether the flow is Gutenboarding or not
 */
function getWpcomNuxPages( isGutenboarding ) {
	return [
		{
			heading: __( 'Welcome to your website', 'full-site-editing' ),
			description: __(
				'Edit your homepage, add the pages you need, and change your site’s look and feel.',
				'full-site-editing'
			),
			imgSrc: editorImage,
			alignBottom: true,
		},
		{
			heading: __( 'Add or edit your content', 'full-site-editing' ),
			description: __(
				'Edit the placeholder content we’ve started you off with, or click the plus sign to add more content.',
				'full-site-editing'
			),
			imgSrc: blockPickerImage,
		},
		{
			heading: __( 'Preview your site as you go', 'full-site-editing' ),
			description: __(
				'As you edit your site content, click “Preview” to see your site the way your visitors will.',
				'full-site-editing'
			),
			imgSrc: previewImage,
			alignBottom: true,
		},
		{
			heading: __( 'Private until you’re ready', 'full-site-editing' ),
			description: __(
				'Your site will remain private as you make changes until you’re ready to launch and share with the world.',
				'full-site-editing'
			),
			imgSrc: privateImage,
			// @TODO: hide for sites that are already public
			shouldHide: ! isGutenboarding,
			alignBottom: true,
		},
	].filter( ( nuxPage ) => ! nuxPage.shouldHide );
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
