/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import EditorFeaturedImagePreview from './preview';

export default class extends React.Component {
	static displayName = 'EditorFeaturedImagePreviewContainer';

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		itemId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ).isRequired,
		maxWidth: PropTypes.number,
		onImageChange: PropTypes.func,
		showEditIcon: PropTypes.bool,
	};

	state = {
		image: null,
	};

	componentDidMount() {
		this.fetchImage();
		MediaStore.on( 'change', this.updateImageState );
	}

	componentDidUpdate( prevProps ) {
		const { siteId, itemId } = this.props;
		if ( siteId !== prevProps.siteId || itemId !== prevProps.itemId ) {
			this.fetchImage();
		}
	}

	componentWillUnmount() {
		MediaStore.off( 'change', this.updateImageState );
	}

	fetchImage = () => {
		// We may not necessarily need to trigger a network request if we
		// already have the data for the media item, so first update the state
		this.updateImageState( () => {
			if ( this.state.image ) {
				return;
			}

			defer( () => {
				MediaActions.fetch( this.props.siteId, this.props.itemId );
			} );
		} );
	};

	updateImageState = ( callback ) => {
		const image = MediaStore.get( this.props.siteId, this.props.itemId );
		this.setState( { image }, () => {
			if ( 'function' === typeof callback ) {
				callback();
			}
		} );

		defer( () => {
			if ( this.props.onImageChange && image && image.ID ) {
				this.props.onImageChange( image.ID );
			}
		} );
	};

	render() {
		return (
			<EditorFeaturedImagePreview
				image={ this.state.image }
				maxWidth={ this.props.maxWidth }
				showEditIcon
			/>
		);
	}
}
