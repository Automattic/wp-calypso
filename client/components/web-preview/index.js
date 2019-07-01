/**
 * External dependencies
 */
import { connect } from 'react-redux';
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

export class WebPreview extends Component {
	constructor() {
		super( ...arguments );
		this.onSetDeviceViewport = this.onSetDeviceViewport.bind( this );
	}

	onSetDeviceViewport( device ) {
		this.props.recordTracksEvent( 'calypso_web_preview_select_viewport_device', { device } );
	}

	filterIframeUrl( url ) {
		return url === 'about:blank' ? url : addQueryArgs( { calypso_token: this.previewId }, url );
	}

	render() {
		return (
			<WebPreviewComponent
				{ ...this.props }
				filterIframeUrl={ this.filterIframeUrl }
				onPreviewShowChange={ this.onPreviewShowChange }
				onSetDeviceViewport={ this.onSetDeviceViewport }
				Toolbar={ Toolbar }
				Wrapper={ RootChild }
			/>
		);
	}
}

const mapState = state => ( {
	disableFocus: isInlineHelpPopoverVisible( state ),
} );

export default connect(
	mapState,
	{ recordTracksEvent, setPreviewShowing }
)( WebPreview );
