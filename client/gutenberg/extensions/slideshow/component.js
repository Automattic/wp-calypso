/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */

export class Slideshow extends Component {
	constructor() {
		super( ...arguments );
	}
	render() {
		return <div className="swiper-container" />;
	}
	componentDidMount() {}
	componentWillUnmount() {}
	componentDidUpdate() {}
}

Slideshow.defaultProps = {};

export default Slideshow;
