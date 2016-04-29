/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';

/**
 * Module vars
 */
const noop = function() {};

module.exports = React.createClass( {
	displayName: 'Headers',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/headers">Header Cake</a>
				</h2>
				<HeaderCake onClick={ noop }>
					Subsection Header aka Header Cake
				</HeaderCake>
				<p>Clicking header cake returns to previous section.</p>
			</div>
		);
	}
} );
