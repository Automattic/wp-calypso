/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { WebPreview as WebPreviewComponent } from '@automattic/calypso-ui';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/route';
import { isInlineHelpPopoverVisible } from 'state/inline-help/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import RootChild from 'components/root-child';
import { setPreviewShowing } from 'state/ui/actions';
import Toolbar from './toolbar';
import SeoPreviewPane from 'components/seo-preview-pane';

export class WebPreview extends Component {
	constructor( props ) {
		super( ...arguments );

		this.state = {
			device: props.defaultViewportDevice,
		};

		this.onDeviceUpdate = this.onDeviceUpdate.bind( this );
		this.onPreviewShowChange = this.onPreviewShowChange.bind( this );
	}

	onDeviceUpdate( device ) {
		this.props.recordTracksEvent( 'calypso_web_preview_select_viewport_device', { device } );
	}

	filterIframeUrl( url ) {
		return url === 'about:blank' ? url : addQueryArgs( { calypso_token: this.previewId }, url );
	}

	getPreviewContent( props ) {
		return 'seo' === props.device ? <SeoPreviewPane { ...props } /> : null;
	}

	onPreviewShowChange( previewShow ) {
		return this.props.setPreviewShowing( previewShow );
	}

	render() {
		return (
			<WebPreviewComponent
				{ ...this.props }
				filterIframeUrl={ this.filterIframeUrl }
				onPreviewShowChange={ this.onPreviewShowChange }
				onDeviceUpdate={ this.onDeviceUpdate }
				getPreviewContent={ this.getPreviewContent }
				Toolbar={ Toolbar }
				Wrapper={ RootChild }
			/>
		);
	}
}

WebPreview.propTypes = {
	// The viewport device to show initially
	defaultViewportDevice: PropTypes.string,
	// Show external link button
	showExternal: PropTypes.bool,
	// Show external link with clipboard input
	showUrl: PropTypes.bool,
	// Show close button
	showClose: PropTypes.bool,
	// Show SEO button
	showSEO: PropTypes.bool,
	// Show device viewport switcher
	showDeviceSwitcher: PropTypes.bool,
	// Show edit button
	showEdit: PropTypes.bool,
	// The URL for the edit button
	editUrl: PropTypes.string,
	// Elements to render on the right side of the toolbar
	children: PropTypes.node,
	// The site/post description passed to the SeoPreviewPane
	frontPageMetaDescription: PropTypes.string,
	// A post object used to override the selected post in the SEO preview
	overridePost: PropTypes.object,
};

WebPreview.defaultProps = {
	defaultViewportDevice: 'computer',
	showExternal: true,
	showClose: true,
	showSEO: true,
	showDeviceSwitcher: true,
	showEdit: false,
	editUrl: null,
	overridePost: null,
};

const mapState = state => ( {
	disableFocus: isInlineHelpPopoverVisible( state ),
} );

export default connect(
	mapState,
	{ recordTracksEvent, setPreviewShowing }
)( WebPreview );
