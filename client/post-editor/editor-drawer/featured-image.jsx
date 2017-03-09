/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { head } from 'lodash';

/**
 * Internal dependencies
 */
import PostActions from 'lib/posts/actions';
import * as stats from 'lib/posts/stats';
import { getFeaturedImageId } from 'lib/posts/utils';
import Accordion from 'components/accordion';
import EditorDrawerWell from 'post-editor/editor-drawer-well';
import FeaturedImage from 'post-editor/editor-featured-image';
import FeaturedImageDropZone from 'post-editor/editor-featured-image/dropzone';

class EditorDrawerFeaturedImage extends Component {
	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		translate: PropTypes.func
	};

	state = {};

	constructor( props ) {
		super( props );

		this.state = {
			isSelecting: false
		};
	}

	startSelecting = () => this.setState( { isSelecting: true } );
	endSelecting = () => this.setState( { isSelecting: false } );

	removeImage() {
		PostActions.edit( {
			featured_image: ''
		} );

		stats.recordStat( 'featured_image_removed' );
		stats.recordEvent( 'Featured image removed' );
	}

	getDropZone = () => {
		return (
			<FeaturedImageDropZone
				site={ this.props.site }
				post={ this.props.post }
			/>
		);
	};

	render() {
		const { translate, site, post } = this.props;

		return (
			<Accordion title={ translate( 'Featured Image' ) }>
				<EditorDrawerWell
					label={ translate( 'Set Featured Image' ) }
					empty={ ! site || ! post || ! getFeaturedImageId( post ) }
					onClick={ this.startSelecting }
					customDropZone={ this.getDropZone() }
					onRemove={ this.removeImage }
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

export default localize( EditorDrawerFeaturedImage );
