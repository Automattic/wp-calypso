/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Performs a blocks preview using an iFrame.
 *
 * @param {object} props component's props
 * @param {string} props.className CSS class to apply to component
 * @param {number} props.postId The post id for the selected layout.
 * @param {string} props.theme The slug for the currently active theme.
 * @param {string} props.locale The currently active locale slug (e.g. 'es')
 */
const BlockFramePreview = ( { className = 'block-iframe-preview', postId, theme, locale } ) => {
	const designsEndpoint = 'https://public-api.wordpress.com/rest/v1/template/demo/';
	const sourceSiteUrl = 'dotcompatterns.wordpress.com';

	const previewUrl = `${ designsEndpoint }${ encodeURIComponent( theme ) }/${ encodeURIComponent(
		sourceSiteUrl
	) }/?post_id=${ encodeURIComponent( postId ) }&language=${ encodeURIComponent( locale ) }`;

	if ( ! postId ) {
		return null;
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div>
			<iframe
				title={ __( 'Preview', 'full-site-editing' ) }
				className={ classnames( 'editor-styles-wrapper', className ) }
				tabIndex={ -1 }
				src={ previewUrl }
			></iframe>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default BlockFramePreview;
