/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Spinner from 'calypso/components/spinner';
import MediaImage from 'calypso/my-sites/media-library/media-image';
import { url, isItemBeingUploaded } from 'calypso/lib/media/utils';

export default class EditorMediaModalDetailPreviewImage extends Component {
	static propTypes = {
		className: PropTypes.string,
		item: PropTypes.object.isRequired,
		site: PropTypes.object,
	};

	static defaultProps = {
		onLoad: noop,
	};

	constructor( props ) {
		super( props );

		this.onImagePreloaderLoad = this.onImagePreloaderLoad.bind( this );
		this.state = { loading: false };
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.item.URL === nextProps.item.URL ) {
			return null;
		}

		this.setState( { loading: true } );
	}

	onImagePreloaderLoad() {
		this.setState( { loading: false } );
		this.props.onLoad();
	}

	render() {
		const src = url( this.props.item, {
			photon: this.props.site && ! this.props.site.is_private,
		} );
		const uploading = isItemBeingUploaded( this.props.item );
		const loading = this.state.loading;
		const isBlob = /^blob/.test( src );

		// Let's add special classes to differentiate
		// the different states that an image could have.
		//
		// - `is-uploading` when the image is being uploaded
		//    from the client to the server.
		// - `is-loading` when the image is being downloaded
		//    from the server to the client.
		// - `is-blob` when the image is shown using local `blob` data.

		const classes = classNames(
			this.props.className,
			'is-image',
			{ 'is-uploading': uploading },
			{ 'is-loading': loading },
			{ 'is-blob': isBlob }
		);

		// A fake image element is added behind the preloading image
		// in order to improve the UX between the states that an image could have,
		// for instance when the image is restored.
		const fakeClasses = classNames(
			this.props.className,
			'is-image',
			'is-fake',
			{ 'is-uploading': uploading },
			{ 'is-loading': loading },
			{ 'is-blob': isBlob }
		);

		return (
			<div>
				<MediaImage
					src={ src }
					width={ this.props.item.width }
					height={ this.props.item.height }
					alt={ this.props.item.alt || this.props.item.title }
					className={ fakeClasses }
				/>

				<MediaImage
					src={ src }
					width={ this.props.item.width }
					height={ this.props.item.height }
					onLoad={ this.onImagePreloaderLoad }
					placeholder={ <span /> }
					alt={ this.props.item.alt || this.props.item.title }
					className={ classes }
				/>

				{ ( uploading || loading ) && <Spinner /> }
			</div>
		);
	}
}
