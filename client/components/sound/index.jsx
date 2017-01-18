/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';

const hasBrowserSupport = () => typeof Audio === 'function';

export default class Sound extends Component {
	static propTypes = {
		playOnMount: PropTypes.bool,
		src: PropTypes.string.isRequired,
		trigger: PropTypes.any,
	};

	componentWillMount() {
		if ( ! hasBrowserSupport() ) {
			return;
		}

		this.sound = new Audio( this.props.src );

		if ( this.props.playOnMount ) {
			this.play();
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.trigger !== prevProps.trigger ) {
			this.play();
		}
	}

	play() {
		if ( ! hasBrowserSupport() ) {
			return;
		}

		this.sound.play();
	}

	render() {
		return null;
	}
}
