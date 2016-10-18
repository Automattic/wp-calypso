/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ImageEditor from '../';
import { getCurrentUser } from 'state/current-user/selectors';

function ImageEditorExample( { primarySiteId } ) {
	const media = {
		URL: 'https://cldup.com/mA_hqNVj0w.jpg'
	};

	const getTestingImage = () => document.querySelector( "#devdocs-example-image-editor-result" );

	const onImageEditorDone = ( error, blob ) => {
		if ( error ) {
			return;
		}
		
		const imageUrl = window.URL.createObjectURL( blob );

		getTestingImage().src = imageUrl;
	};

	const onImageEditorReset = () => {
		getTestingImage().src = media.URL;
	};

	return (
		<div>
			<div style={ { height: '80vh' } }>
				<ImageEditor
					siteId={ primarySiteId }
					media={ media }
					onDone={ onImageEditorDone }
					onReset={ onImageEditorReset }
				/>
			</div>
			<div style={ {
				textAlign: 'center',
				marginTop: '15px'
			} }>
				<h4>Changes to the image above are shown below</h4>
				<img
					id="devdocs-example-image-editor-result"
					src={ media.URL }
				/>
			</div>
		</div>
	);
}

const ConnectedImageEditorExample = connect( ( state ) => {
	const primarySiteId = get( getCurrentUser( state ), 'primary_blog', null );

	return {
		primarySiteId
	};
} )( ImageEditorExample );

ConnectedImageEditorExample.displayName = 'ImageEditor';

export default ConnectedImageEditorExample;
