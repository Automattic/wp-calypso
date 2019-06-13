/**
 * External dependencies
 */
import { IconButton, ServerSideRender, Toolbar } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { BlockControls } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

function SiteLogoEdit( { className } ) {
	const siteIdentityUrl = addQueryArgs( 'customize.php', {
		'autofocus[section]': 'title_tagline',
		return: window.location.href,
	} );

	return (
		<Fragment>
			<BlockControls>
				<Toolbar>
					<IconButton icon="edit" label={ __( 'Edit Site Logo' ) } href={ siteIdentityUrl } />
				</Toolbar>
			</BlockControls>
			<ServerSideRender
				className={ className }
				block="a8c/site-logo"
				attributes={ { editorPreview: true } }
			/>
		</Fragment>
	);
}

export default SiteLogoEdit;
