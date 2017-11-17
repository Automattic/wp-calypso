/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, some } from 'lodash';

/**
 * Internal dependencies
 */
import MediaStore from 'lib/media/store';
import MediaUtils from 'lib/media/utils';
import Spinner from 'components/spinner';
import SpinnerLine from 'components/spinner-line';
import ImagePreloader from 'components/image-preloader';
import { getSelectedSiteId } from 'state/ui/selectors';

class EditorFeaturedImagePreview extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		image: PropTypes.object,
		maxWidth: PropTypes.number,
	};

	static initialState = {
		height: null,
		transientSrc: null,
	};

	state = this.constructor.initialState;

	componentWillReceiveProps( nextProps ) {
		const currentSrc = this.src();
		if ( ! currentSrc || currentSrc === this.src( nextProps ) ) {
			return;
		}

		// To prevent container height from collapsing and expanding rapidly,
		// we preserve the current height while the next image loads
		const nextState = {
			height: this.refs.preview.clientHeight,
		};

		// If the next image is the persisted copy of an in-progress upload, we
		// should continue to show the transient blob image as the placeholder
		// instead of a spinner, since we know it'll appear visually identical
		if ( this.isReceivingPersistedImage( this.props, nextProps ) ) {
			nextState.transientSrc = currentSrc;
		}

		this.setState( nextState );
	}

	isReceivingPersistedImage = ( props, nextProps ) => {
		const { siteId } = this.props;
		if ( siteId !== nextProps.siteId ) {
			return false;
		}

		const { image } = this.props;
		if ( ! image || ! image.transient || ! nextProps.image ) {
			return false;
		}

		// Compare images by resolving the media store reference for the
		// transient copy. MediaStore tracks pointers from transient media
		// to its persisted copy, so we can compare the resolved object IDs
		const media = MediaStore.get( siteId, image.ID );
		return media && media.ID === nextProps.image.ID;
	};

	src = ( props = this.props ) => {
		if ( ! props.image ) {
			return;
		}

		return MediaUtils.url( props.image, {
			maxWidth: this.props.maxWidth,
			size: 'post-thumbnail',
		} );
	};

	clearState = () => {
		if ( ! some( this.state ) ) {
			return;
		}

		this.setState( this.constructor.initialState );
	};

	render() {
		const { height } = this.state;
		const classes = classNames( 'editor-featured-image__preview', {
			'is-transient': get( this.props.image, 'transient' ),
			'has-assigned-height': !! height,
		} );

		let placeholder;
		if ( this.state.transientSrc ) {
			placeholder = <img src={ this.state.transientSrc } />;
		} else {
			placeholder = <SpinnerLine />;
		}

		return (
			<div ref="preview" className={ classes } style={ { height } }>
				<Spinner />
				<ImagePreloader
					placeholder={ placeholder }
					src={ this.src() }
					onLoad={ this.clearState }
					className="editor-featured-image__preview-image"
				/>
			</div>
		);
	}
}

export default connect( state => {
	return {
		siteId: getSelectedSiteId( state ),
	};
} )( EditorFeaturedImagePreview );
