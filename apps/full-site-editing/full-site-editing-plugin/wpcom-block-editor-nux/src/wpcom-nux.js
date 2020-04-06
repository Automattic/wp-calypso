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
import './styles.scss';
import blockImage from './images/block.svg';
import blockPickerImage from './images/block-picker.svg';
import editorImage from './images/editor.svg';
import privateImage from './images/private.svg';

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

	// @TODO: Change to 'Welcome to your new website' for Gutenboarding, in other situations keep "editor"
	const welcomeHeading = __( 'Welcome to the WordPress editor' );

	/**
	 * Currently, the Guide content is mostly copied from Gutenberg. This can be
	 * updated if/as we have new designs for the NUX on wpcom.
	 */
	return (
		<Guide
			className="wpcom-block-editor-nux"
			contentLabel={ welcomeHeading }
			finishButtonText={ __( 'Get started' ) }
			onFinish={ dismissWpcomNux }
		>
			<GuidePage className="wpcom-block-editor-nux__page">
				<h1 className="wpcom-block-editor-nux__heading">{ welcomeHeading }</h1>
				<p className="wpcom-block-editor-nux__text">
					{ __( 'Create and edit site pages, and customize the look and feel of each page.' ) }
				</p>
				<img
					alt=""
					aria-hidden="true"
					className="wpcom-block-editor-nux__image"
					src={ editorImage }
				/>
			</GuidePage>

			<GuidePage className="wpcom-block-editor-nux__page">
				<h1 className="wpcom-block-editor-nux__heading">
					{ __( 'Create pages and add your content' ) }
				</h1>
				<img
					alt=""
					aria-hidden="true"
					className="wpcom-block-editor-nux__image"
					src={ blockImage }
				/>
				<p className="wpcom-block-editor-nux__text">
					{ __(
						'Create and rearrange your site pages. Customize your site navigation menus so your visitors can explore your site.'
					) }
				</p>
			</GuidePage>

			<GuidePage className="wpcom-block-editor-nux__page">
				<h1 className="wpcom-block-editor-nux__heading">{ __( 'Add anything you want' ) }</h1>
				<img
					alt=""
					aria-hidden="true"
					className="wpcom-block-editor-nux__image"
					src={ blockPickerImage }
				/>
				<p className="wpcom-block-editor-nux__text">
					{ __(
						'Insert text, photos, forms, Yelp reviews, testimonials, maps, and many more types of blocks. Rearrange blocks on your pages to meet your needs.'
					) }
				</p>
			</GuidePage>

			{ /* @TODO: hide for sites that are already public */ }
			<GuidePage className="wpcom-block-editor-nux__page">
				<h1 className="wpcom-block-editor-nux__heading">
					{ __( "Private until you're ready to launch" ) }
				</h1>
				<img
					alt=""
					aria-hidden="true"
					className="wpcom-block-editor-nux__image"
					src={ privateImage }
				/>
				<p className="wpcom-block-editor-nux__text">
					{ __(
						"Your site remains private until you're ready to launch. Take your time and make as many changes as you need until it's ready to share with the world."
					) }
				</p>
			</GuidePage>
		</Guide>
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
