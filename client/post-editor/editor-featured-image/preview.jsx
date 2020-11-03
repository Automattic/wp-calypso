/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, some } from 'lodash';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { url } from 'calypso/lib/media/utils';
import Spinner from 'calypso/components/spinner';
import SpinnerLine from 'calypso/components/spinner-line';
import ImagePreloader from 'calypso/components/image-preloader';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getMediaItem from 'calypso/state/media/thunks/get-media-item';

class EditorFeaturedImagePreview extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		image: PropTypes.object,
		maxWidth: PropTypes.number,
		showEditIcon: PropTypes.bool,
	};

	static initialState = {
		height: null,
		transientSrc: null,
		showEditIcon: false,
	};

	state = this.constructor.initialState;

	constructor( props ) {
		super( props );

		this.previewRef = React.createRef();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const currentSrc = this.src();
		if ( ! currentSrc || currentSrc === this.src( nextProps ) ) {
			return;
		}

		// To prevent container height from collapsing and expanding rapidly,
		// we preserve the current height while the next image loads
		const nextState = {
			height: this.previewRef.current.clientHeight,
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
		// transient copy. Media state tracks pointers from transient media
		// to its persisted copy, so we can compare the resolved object IDs
		const media = this.props.getMediaItem( siteId, image.ID );
		return media && media.ID === nextProps.image.ID;
	};

	src = ( props = this.props ) => {
		if ( ! props.image ) {
			return;
		}

		return url( props.image, {
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
			placeholder = (
				<img
					src={ this.state.transientSrc }
					className="editor-featured-image__preview-image"
					alt="placeholder"
				/>
			);
		} else {
			placeholder = <SpinnerLine />;
		}

		return (
			<div ref={ this.previewRef } className={ classes } style={ { height } }>
				<Spinner />
				<ImagePreloader
					placeholder={ placeholder }
					src={ this.src() }
					onLoad={ this.clearState }
					className="editor-featured-image__preview-image"
				/>
				{ this.props.showEditIcon && (
					<Gridicon icon="pencil" className="editor-featured-image__edit-icon" />
				) }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		return {
			siteId: getSelectedSiteId( state ),
		};
	},
	{ getMediaItem }
)( EditorFeaturedImagePreview );
