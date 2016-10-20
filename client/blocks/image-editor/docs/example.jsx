/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ImageEditor from '../';
import { getCurrentUser } from 'state/current-user/selectors';

class ImageEditorExample extends Component {
	media = {
		URL: 'https://cldup.com/mA_hqNVj0w.jpg'
	};

	getTestingImage = () => document.querySelector( "#devdocs-example-image-editor-result" );

	onImageEditorDone = ( error, blob ) => {
		if ( error ) {
			return;
		}
		
		const imageUrl = window.URL.createObjectURL( blob );

		this.getTestingImage().src = imageUrl;
	};

	onImageEditorReset = () => {
		this.getTestingImage().src = this.media.URL;
	};

	render() {
		const {
			primarySiteId
		} = this.props;
		
		return (
			<div>
				<div style={ { height: '80vh' } }>
					<ImageEditor
						siteId={ primarySiteId }
						media={ this.media }
						onDone={ this.onImageEditorDone }
						onReset={ this.onImageEditorReset }
					/>
				</div>
				<div style={ {
					textAlign: 'center',
					marginTop: '15px'
				} }>
					<h4>Changes to the image above are shown below</h4>
					<img
						id="devdocs-example-image-editor-result"
						src={ this.media.URL }
					/>
				</div>
			</div>
		);
	}
}

const ConnectedImageEditorExample = connect( ( state ) => {
	const primarySiteId = get( getCurrentUser( state ), 'primary_blog', null );

	return {
		primarySiteId
	};
} )( ImageEditorExample );

ConnectedImageEditorExample.displayName = 'ImageEditor';

export default ConnectedImageEditorExample;
