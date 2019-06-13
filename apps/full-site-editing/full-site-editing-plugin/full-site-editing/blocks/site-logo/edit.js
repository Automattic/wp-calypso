/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { IconButton, ServerSideRender, Toolbar } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { BlockControls } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

function SiteLogoEdit( { className } ) {
	const navigateToCustomerSiteIdentity = () => {
		const siteIdentityLink = addQueryArgs( 'customize.php', {
			'autofocus[section]': 'title_tagline',
			return: window.location.href,
		} );
		window.location.href = siteIdentityLink;
	};

	return (
		<Fragment>
			<BlockControls>
				<Toolbar>
					<IconButton
						className={ 'components-toolbar__control' }
						icon="edit"
						label={ __( 'Edit Site Logo' ) }
						onClick={ navigateToCustomerSiteIdentity }
					/>
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
