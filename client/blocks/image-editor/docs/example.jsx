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
	
	const onImageExtracted = ( blob ) => {
		const imageUrl = window.URL.createObjectURL( blob );
		
		document.querySelector( "#devdocs-example-image-editor-result" ).src = imageUrl;
	};
	
	return (
		<div>
			<div style={ { height: '80vh' } }>
				<ImageEditor
					siteId={ primarySiteId }
					media={ media }
					onImageExtracted={ onImageExtracted }
				/>
			</div>
			
			<img 
				id="devdocs-example-image-editor-result"
				style={ {
					display: 'block',
					margin: '10px auto'
				} }
			/>
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
