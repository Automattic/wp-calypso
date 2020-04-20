/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';

/**
 * Module variables
 */
const LoadStatus = {
	PENDING: 'PENDING',
	LOADING: 'LOADING',
	LOADED: 'LOADED',
	FAILED: 'FAILED',
};

export class ImageLoader extends Component {
	static propTypes = {
		src: PropTypes.string.isRequired,
		placeholder: PropTypes.element.isRequired,
		children: PropTypes.node,
	};

	state = {
		status: LoadStatus.PENDING,
	};

	UNSAFE_componentWillMount() {
		this.createLoader();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.src !== this.props.src ) {
			this.createLoader( nextProps );
		}
	}

	componentWillUnmount() {
		this.destroyLoader();
	}

	createLoader = ( nextProps ) => {
		const src = ( nextProps || this.props ).src;

		this.destroyLoader();

		this.image = new Image();
		this.image.src = src;
		this.image.onload = this.onLoadComplete;
		this.image.onerror = this.onLoadComplete;

		this.setState( {
			status: LoadStatus.LOADING,
		} );
	};

	destroyLoader = () => {
		if ( ! this.image ) {
			return;
		}

		this.image.onload = noop;
		this.image.onerror = noop;
		delete this.image;
	};

	onLoadComplete = ( event ) => {
		this.destroyLoader();

		this.setState( {
			status: 'load' === event.type ? LoadStatus.LOADED : LoadStatus.FAILED,
		} );
	};

	render() {
		const { children, placeholder, src } = this.props;
		const { status } = this.state;

		return (
			<div className="image-preloader">
				{ status === LoadStatus.LOADING && placeholder }
				{ status === LoadStatus.LOADED && <img src={ src } /> }
				{ status === LoadStatus.FAILED && children }
			</div>
		);
	}
}

export default ImageLoader;
