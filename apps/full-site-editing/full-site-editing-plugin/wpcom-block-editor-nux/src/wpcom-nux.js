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
//import privateImage from './images/private.svg';

function WpcomNux() {
	const { isWpcomNuxEnabled, isSPTOpen } = useSelect( select => ( {
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

	const isGutenboarding = !! window.calypsoifyGutenberg?.isGutenboarding;
	const welcomeHeading = isGutenboarding
		? __( 'Welcome to your new website' )
		: __( 'Welcome to the WordPress editor' );

	return (
		<Guide
			className="wpcom-block-editor-nux"
			contentLabel={ welcomeHeading }
			finishButtonText={ __( 'Get started' ) }
			onFinish={ dismissWpcomNux }
		>
			<NuxPage
				heading={ welcomeHeading }
				description={ __(
					'Create and edit site pages, and customize the look and feel of each page.'
				) }
				imgSrc={ editorImage }
				alignBottom
			/>

			<NuxPage
				heading={ __( 'Create pages and add your content' ) }
				description={ __(
					'Create and rearrange your site pages. Customize your site navigation menus so your visitors can explore your site.'
				) }
				imgSrc={ blockImage }
			/>

			<NuxPage
				heading={ __( 'Add anything you want' ) }
				description={ __(
					'Insert text, photos, forms, Yelp reviews, testimonials, maps, and many more types of blocks. Rearrange blocks on your pages to meet your needs.'
				) }
				imgSrc={ blockPickerImage }
			/>

			{ /* @TODO: hide for sites that are already public
			<NuxPage
				heading={ __( "Private until you're ready to launch" ) }
				description={ __(
					"Your site remains private until you're ready to launch. Take your time and make as many changes as you need until it's ready to share with the world."
				) }
				imgSrc={ privateImage }
				alignBottom
			/>
			*/ }
		</Guide>
	);
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
