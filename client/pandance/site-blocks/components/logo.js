/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';


/**
 * Internal dependencies
 */
import ImageEditor from 'blocks/image-editor';
import { getCurrentUser } from 'state/current-user/selectors';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';

export const Logo = props => <div className="logo">

</div>;

class ImageEditorExample extends Component {
	constructor() {
		super();

		this.state = {
			media: {
				URL: 'https://cldup.com/mA_hqNVj0w.jpg'
			}
		};
	}

	getTestingImage = () => document.querySelector( "#devdocs-example-image-editor-result" );

	onImageEditorDone = ( error, blob ) => {
		if ( error ) {
			return;
		}
		this.props.next();
	};

	onImageEditorReset = () => {
		this.getTestingImage().src = this.state.media.URL || this.state.media.src;
	};

	componentDidMount() {
		const fileInput = document.querySelector( '#devdocs-example-image-editor-file-input' );

		fileInput.addEventListener( 'change', this.onImageUpload );
	}

	onImageUpload = ( e ) => {
		const imageFile = e.target.files[ 0 ];

		const imageObjectUrl = URL.createObjectURL( imageFile );

		this.setState( {
			media: {
				src: imageObjectUrl
			}
		} );

		this.getTestingImage().src = imageObjectUrl;
	};

	render() {
		const {
			primarySiteId
		} = this.props;

		return (
			<div className="wrapper">
				<div style={ {
					marginBottom: '20px'
				} }>
					<h4>Upload an image</h4>
					<input type="file" id="devdocs-example-image-editor-file-input" />
				</div>

				<div style={ { height: '40vh' } }>
					<ImageEditor
						siteId={ primarySiteId }
						media={ this.state.media }
						onDone={ this.onImageEditorDone }
						onReset={ this.onImageEditorReset }
						allowedAspectRatios={ [
							AspectRatios.ASPECT_1X1,
							AspectRatios.ASPECT_4X3,
							AspectRatios.ASPECT_16X9
						] }
						defaultAspectRatio={ AspectRatios.ASPECT_1X1 }
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

export const EditLogo = ConnectedImageEditorExample;
