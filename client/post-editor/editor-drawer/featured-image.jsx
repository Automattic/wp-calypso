/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PostActions from 'lib/posts/actions';
import * as stats from 'lib/posts/stats';
import { getFeaturedImageId } from 'lib/posts/utils';
import Accordion from 'components/accordion';
import Gridicon from 'components/gridicon';
import EditorDrawerWell from 'post-editor/editor-drawer-well';
import FeaturedImage from 'post-editor/editor-featured-image';

class EditorDrawerFeaturedImage extends Component {
	constructor( props ) {
		super( props );
		this.startSelecting = () => this.setState( { isSelecting: true } );
		this.endSelecting = () => this.setState( { isSelecting: false } );
		this.state = { isSelecting: false };
	}

	removeImage() {
		PostActions.edit( {
			featured_image: ''
		} );

		stats.recordStat( 'featured_image_removed' );
		stats.recordEvent( 'Featured image removed' );
	}

	render() {
		const { translate, site, post } = this.props;

		return (
			<Accordion
				title={ translate( 'Featured Image' ) }
				icon={ <Gridicon icon="image" /> }>
				<EditorDrawerWell
					icon="image"
					label={ translate( 'Set Featured Image' ) }
					empty={ ! site || ! post || ! getFeaturedImageId( post ) }
					onClick={ this.startSelecting }
					onRemove={ this.removeImage }>
					<FeaturedImage
						selecting={ this.state.isSelecting }
						onImageSelected={ this.endSelecting }
						site={ site }
						post={ post } />
				</EditorDrawerWell>
			</Accordion>
		);
	}
}

EditorDrawerFeaturedImage.propTypes = {
	site: PropTypes.object,
	post: PropTypes.object,
	translate: PropTypes.func
};

export default localize( EditorDrawerFeaturedImage );
