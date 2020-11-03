/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getFeaturedImageId } from 'calypso/state/posts/utils';
import Accordion from 'calypso/components/accordion';
import EditorDrawerWell from 'calypso/post-editor/editor-drawer-well';
import FeaturedImage from 'calypso/post-editor/editor-featured-image';
import FeaturedImageDropZone from 'calypso/post-editor/editor-featured-image/dropzone';
import isDropZoneVisible from 'calypso/state/selectors/is-drop-zone-visible';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getEditedPost } from 'calypso/state/posts/selectors';

class EditorDrawerFeaturedImage extends Component {
	static propTypes = {
		translate: PropTypes.func,
		hasFeaturedImage: PropTypes.bool,
		isDrawerHidden: PropTypes.bool,
	};

	static defaultProps = {
		isDrawerHidden: false,
	};

	state = {
		isSelecting: false,
	};

	startSelecting = () => this.setState( { isSelecting: true } );
	endSelecting = () => this.setState( { isSelecting: false } );

	render() {
		const { translate, hasFeaturedImage, isDrawerHidden } = this.props;

		return (
			<Accordion
				title={ translate( 'Featured Image' ) }
				forceExpand={ isDrawerHidden }
				e2eTitle="featured-image"
			>
				<EditorDrawerWell
					label={ translate( 'Set Featured Image' ) }
					empty={ ! hasFeaturedImage }
					onClick={ this.startSelecting }
					customDropZone={ <FeaturedImageDropZone /> }
					isHidden={ isDrawerHidden }
				>
					<FeaturedImage
						selecting={ this.state.isSelecting }
						onImageSelected={ this.endSelecting }
					/>
				</EditorDrawerWell>
			</Accordion>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const post = getEditedPost( state, siteId, postId );
	const hasFeaturedImage = !! getFeaturedImageId( post );
	const isDrawerHidden = isDropZoneVisible( state, 'featuredImage' );

	return { hasFeaturedImage, isDrawerHidden };
} )( localize( EditorDrawerFeaturedImage ) );
