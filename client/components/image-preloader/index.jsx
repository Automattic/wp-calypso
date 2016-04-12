/**
 * External dependencies
 */
import React from 'react';
import omit from 'lodash/omit';
import noop from 'lodash/noop';

/**
 * Constants
 */
const LoadStatus = {
	PENDING: 'PENDING',
	LOADING: 'LOADING',
	LOADED: 'LOADED',
	FAILED: 'FAILED'
};

export default React.createClass( {
	displayName: 'ImagePreloader',

	propTypes: {
		src: React.PropTypes.string,
		placeholder: React.PropTypes.element.isRequired,
		children: React.PropTypes.node,
		onLoad: React.PropTypes.func,
		onError: React.PropTypes.func
	},

	getInitialState() {
		return {
			status: LoadStatus.PENDING
		};
	},

	componentWillMount() {
		this.createLoader();
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.src !== this.props.src ) {
			this.createLoader( nextProps );
		}
	},

	componentWillUnmount() {
		this.destroyLoader();
	},

	createLoader( nextProps ) {
		const src = ( nextProps || this.props ).src;

		this.destroyLoader();
		this.setState( {
			status: LoadStatus.LOADING
		} );

		if ( ! src ) {
			return;
		}

		this.image = new Image();
		this.image.src = src;
		this.image.onload = this.onLoadComplete;
		this.image.onerror = this.onLoadComplete;
	},

	destroyLoader() {
		if ( ! this.image ) {
			return;
		}

		this.image.onload = noop;
		this.image.onerror = noop;
		delete this.image;
	},

	onLoadComplete( event ) {
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
	},

	render() {
		let children, imageProps;

		switch ( this.state.status ) {
			case LoadStatus.LOADING:
				children = this.props.placeholder;
				break;

			case LoadStatus.LOADED:
				imageProps = omit( this.props, Object.keys( this.constructor.propTypes ) );
				children = <img src={ this.props.src } { ...imageProps } />;
				break;

			case LoadStatus.FAILED:
				children = this.props.children;
				break;

			default: break;
		}

		return (
			<div className="image-preloader">
				{ children }
			</div>
		);
	}
} );
