/** @format */

/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Slideshow from './component.js';

class SlideshowEdit extends Component {
	constructor() {
		super( ...arguments );
	}
	componentDidMount() {}
	render() {
		return (
			<Fragment>
				<Slideshow />
			</Fragment>
		);
	}
}

export default SlideshowEdit;
