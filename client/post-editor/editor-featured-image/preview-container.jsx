/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EditorFeaturedImagePreview from './preview';
import getMediaItem from 'state/selectors/get-media-item';
import { fetchMediaItem } from 'state/media/thunks';

class EditorFeaturedImagePreviewContainer extends React.Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		itemId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ).isRequired,
		maxWidth: PropTypes.number,
		onImageChange: PropTypes.func,
		showEditIcon: PropTypes.bool,
	};

	componentDidMount() {
		this.props.fetchMediaItem( this.props.siteId, this.props.itemId );
	}

	componentDidUpdate( prevProps ) {
		const { siteId, itemId, image } = this.props;
		if ( siteId !== prevProps.siteId || itemId !== prevProps.itemId ) {
			if ( ! image ) {
				this.props.fetchMediaItem( siteId, itemId );
			}

			if ( this.props.onImageChange && image && image.ID ) {
				this.props.onImageChange( itemId );
			}
		}
	}

	render() {
		return (
			<EditorFeaturedImagePreview
				image={ this.props.image }
				maxWidth={ this.props.maxWidth }
				showEditIcon
			/>
		);
	}
}

const mapStateToProps = ( state, { siteId, itemId } ) => ( {
	image: getMediaItem( state, siteId, itemId ),
} );

export default connect( mapStateToProps, { fetchMediaItem } )(
	EditorFeaturedImagePreviewContainer
);
