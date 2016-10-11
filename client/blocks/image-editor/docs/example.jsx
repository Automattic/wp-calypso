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
	
	return (
		<div style={ { height: '80vh' } }>
			<ImageEditor
				siteId={ primarySiteId }
				media={ media }
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
