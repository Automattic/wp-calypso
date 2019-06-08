/**
 * External dependencies
 */
import { IconButton, ServerSideRender, Toolbar } from '@wordpress/components';
import { Component, Fragment, createRef } from '@wordpress/element';
import { BlockControls } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

class SiteLogoEdit extends Component {
	siteLogo = createRef();

	navigateToCustomerSiteIdentity() {
		const siteIdenityLink = addQueryArgs( 'customize.php', {
			'autofocus[section]': 'title_tagline',
			return: window.location.href,
		} );
		window.location.href = siteIdenityLink;
	}

	render() {
		return (
			<Fragment>
				<BlockControls>
					<Toolbar>
						<IconButton
							icon="edit"
							label={ __( 'Edit Site Logo' ) }
							onClick={ this.navigateToCustomerSiteIdentity }
						/>
					</Toolbar>
				</BlockControls>
				<ServerSideRender
					ref={ this.siteLogo }
					block="a8c/site-logo"
					attributes={ { editorPreview: true } }
				/>
			</Fragment>
		);
	}
}

export default SiteLogoEdit;
