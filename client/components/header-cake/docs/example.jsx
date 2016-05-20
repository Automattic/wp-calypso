/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
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
			<DocsExample
				title="Header Cake"
				url="/devdocs/design/headers"
				componentUsageStats={ this.props.componentUsageStats }
			>
				<HeaderCake onClick={ noop }>
					Subsection Header aka Header Cake
				</HeaderCake>
				<p>Clicking header cake returns to previous section.</p>
			</DocsExample>
		);
	}
} );
