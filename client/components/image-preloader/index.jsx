/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';

/**
 * Constants
 */
const LoadStatus = {
	PENDING: 'PENDING',
	LOADING: 'LOADING',
	LOADED: 'LOADED',
	FAILED: 'FAILED',
};

export default class ImagePreloader extends React.Component {
	static propTypes = {
		src: PropTypes.string,
		placeholder: PropTypes.element.isRequired,
		onLoad: PropTypes.func,
		onError: PropTypes.func,
	};

	state = {
		status: LoadStatus.PENDING,
	};

	componentDidMount() {
		this.createLoader();
	}

	componentDidUpdate( prevPropsProps ) {
		if ( prevPropsProps.src !== this.props.src ) {
			this.createLoader( this.props );
		}
	}

	componentWillUnmount() {
		this.destroyLoader();
	}

	createLoader = props => {
		const src = ( props || this.props ).src;

		this.destroyLoader();
		this.setState( {
			status: LoadStatus.LOADING,
		} );

		if ( ! src ) {
			return;
		}

		this.image = new Image();
		this.image.src = src;
		this.image.onload = this.onLoadComplete;
		this.image.onerror = this.onLoadComplete;
	};

	destroyLoader = () => {
		if ( ! this.image ) {
			return;
		}

		this.image.onload = noop;
		this.image.onerror = noop;
		delete this.image;
	};

	onLoadComplete = event => {
		this.destroyLoader();

		if ( event.type !== 'load' ) {
			return this.setState( { status: LoadStatus.FAILED }, () => {
				if ( this.props.onError ) {
					this.props.onError( event );
				}
			} );
		}

		this.setState( { status: LoadStatus.LOADED }, () => {
			if ( this.props.onLoad ) {
				this.props.onLoad( event );
			}
		} );
	};

	render() {
		const { src, placeholder, onLoad, onError, ...imageProps } = this.props;
		let children;

		switch ( this.state.status ) {
			case LoadStatus.LOADING:
				children = this.props.placeholder;
				break;

			case LoadStatus.LOADED:
				// Assume image props always include alt text.
				// eslint-disable-next-line jsx-a11y/alt-text
				children = <img src={ this.props.src } { ...imageProps } />;
				break;

			case LoadStatus.FAILED:
				children = this.props.children;
				break;

			default:
				break;
		}

		return <div className="image-preloader">{ children }</div>;
	}
}
