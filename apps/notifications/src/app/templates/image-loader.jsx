import PropTypes from 'prop-types';
import { Component } from 'react';

/**
 * Module variables
 */
const LoadStatus = {
	PENDING: 'PENDING',
	LOADING: 'LOADING',
	LOADED: 'LOADED',
	FAILED: 'FAILED',
};
const noop = () => {};

export class ImageLoader extends Component {
	static propTypes = {
		src: PropTypes.string.isRequired,
		placeholder: PropTypes.element.isRequired,
		children: PropTypes.node,
	};

	constructor( props ) {
		super( props );

		this.image = new Image();
		this.image.src = props.src;
		this.image.onload = this.onLoadComplete;
		this.image.onerror = this.onLoadComplete;

		this.state = {
			status: LoadStatus.LOADING,
		};
	}

	componentWillUnmount() {
		this.destroyLoader();
	}

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
				{ /* eslint-disable-next-line jsx-a11y/alt-text */ }
				{ status === LoadStatus.LOADED && <img src={ src } /> }
				{ status === LoadStatus.FAILED && children }
			</div>
		);
	}
}

export default ImageLoader;
