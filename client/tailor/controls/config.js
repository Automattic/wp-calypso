/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import { translate } from 'lib/mixins/i18n';
import SiteTitleControl from './site-title-control';
import HeaderImageControl from './header-image-control';

/**
 * These are the sections of the customizer (or "controls", here).
 *
 * Each control must have these properties:
 *
 * - id: A unique ID for the control.
 * - parentId: (Optional) The ID of a parent control if this is a sub-control.
 * - title: A string to display for the control.
 * - componentClass: A React class to use for the control.
 * - setupFunction: Called when customizer starts.
 * - updatePreviewFunction: Called when customizations change.
 * - saveFunction: Called when customizer saves.
 *
 * See the README for details of these objects.
 */
const controlConfig = [
	{
		id: 'siteTitle',
		title: translate( 'Site Title, Tagline, and Logo' ),
		componentClass: SiteTitleControl,
		setupFunction: ( actions, state, siteId ) => {
			return new Promise( ( resolve ) => {
				const selectedSite = state.sites.items[ siteId ];
				if ( selectedSite ) {
					resolve( { blogname: selectedSite.title, blogdescription: selectedSite.description } );
				}
			} );
		},
		updatePreviewFunction: ( previewDoc, customizations ) => {
			const blognameElement = previewDoc.querySelector( '.site-title a' );
			const blogdescriptionElement = previewDoc.querySelector( '.site-description' );
			if ( blognameElement ) {
				blognameElement.innerHTML = customizations.blogname;
			}
			if ( blogdescriptionElement ) {
				blogdescriptionElement.innerHTML = customizations.blogdescription;
			}
		},
		saveFunction: ( actions, customizations, siteId ) => {
			const { blogname, blogdescription } = customizations;
			if ( blogname && blogdescription ) {
				actions.setSiteSettings( siteId, { blogname, blogdescription } );
			}
		}
	},

	{
		id: 'headerImage',
		title: translate( 'Header Image' ),
		componentClass: HeaderImageControl,
		setupFunction: ( actions, state, siteId ) => {
			return new Promise( ( resolve ) => {
				const selectedSite = state.sites.items[ siteId ];
				if ( selectedSite ) {
					const headerImagePostId = get( selectedSite, 'options.header_image.attachment_id' );
					const headerImageUrl = get( selectedSite, 'options.header_image.url' );
					const headerImageWidth = get( selectedSite, 'options.header_image.width' );
					const headerImageHeight = get( selectedSite, 'options.header_image.height' );
					resolve( { headerImagePostId, headerImageUrl, headerImageWidth, headerImageHeight } );
				}
			} );
		},
		updatePreviewFunction: ( previewDoc, customizations ) => {
			const headerImageSelector = [
				'.header-image a img[src]',
				'.header-image img[src]',
				'.site-branding a img[src]',
				'.site-header-image img',
				'.header-image-link img[src]',
				'img.header-image[src]',
				'img.header-img[src]',
				'img.headerimage[src]',
				'img.custom-header[src]',
				'.featured-header-image a img[src]',
			].join();
			const headerImageElement = previewDoc.querySelector( headerImageSelector );
			if ( ! headerImageElement ) {
				return;
			}
			if ( ! customizations.headerImageUrl ) {
				headerImageElement.style.display = 'none';
				return;
			}
			headerImageElement.src = customizations.headerImageUrl;
			headerImageElement.style.display = 'block';
		},
		saveFunction: ( actions, customizations, siteId ) => {
			const { headerImagePostId, headerImageUrl, headerImageHeight, headerImageWidth } = customizations;
			if ( headerImagePostId && headerImageUrl && headerImageHeight && headerImageWidth ) {
				return actions.setHeaderImage( siteId, headerImageUrl, headerImagePostId, headerImageWidth, headerImageHeight );
			}
			actions.removeHeaderImage( siteId );
		}
	}
];

export default controlConfig;
