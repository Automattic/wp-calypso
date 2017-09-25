/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import PostActions from 'lib/posts/actions';
import * as stats from 'lib/posts/stats';
import { getFeaturedImageId } from 'lib/posts/utils';
import EditorDrawerWell from 'post-editor/editor-drawer-well';
import FeaturedImage from 'post-editor/editor-featured-image';
import FeaturedImageDropZone from 'post-editor/editor-featured-image/dropzone';
import isDropZoneVisible from 'state/selectors/is-drop-zone-visible';

class EditorDrawerFeaturedImage extends Component {
	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		translate: PropTypes.func,
		isDrawerHidden: PropTypes.bool,
	};

	static defaultProps = {
		isDrawerHidden: false,
	};

	state = {
		isSelecting: false
	};

	startSelecting = () => this.setState( { isSelecting: true } );
	endSelecting = () => this.setState( { isSelecting: false } );

	removeImage() {
		PostActions.edit( {
			featured_image: ''
		} );

		stats.recordStat( 'featured_image_removed' );
		stats.recordEvent( 'Featured image removed' );
	}

	render() {
		const { translate, site, post, isDrawerHidden } = this.props;

		return (
			<Accordion title={ translate( 'Featured Image' ) } forceExpand={ isDrawerHidden } e2eTitle={ 'featured-image' }>
				<EditorDrawerWell
					label={ translate( 'Set Featured Image' ) }
					empty={ ! site || ! post || ! getFeaturedImageId( post ) }
					onClick={ this.startSelecting }
					customDropZone={ <FeaturedImageDropZone /> }
					onRemove={ this.removeImage }
					isHidden={ isDrawerHidden }
				>
					<FeaturedImage
						selecting={ this.state.isSelecting }
						onImageSelected={ this.endSelecting }
						site={ site }
						post={ post }
					/>
				</EditorDrawerWell>
			</Accordion>
		);
	}
}

export default connect(
	( state ) => ( {
		isDrawerHidden: isDropZoneVisible( state, 'featuredImage' )
	} )
)( localize( EditorDrawerFeaturedImage ) );
