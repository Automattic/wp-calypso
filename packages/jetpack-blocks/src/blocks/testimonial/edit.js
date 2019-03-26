/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { icon, title } from './';

import './editor.scss';

class TestimonialEdit extends Component {
	render() {
		return (
			<Fragment>
				<div className={ `wp-block-jetpack-testimonial` }>
					<Placeholder icon={ icon } label={ title } />
				</div>
			</Fragment>
		);
	}
}
export default TestimonialEdit;
