/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import Spinner from 'components/spinner';

module.exports = React.createClass( {
	displayName: 'Spinner',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Spinner"
				url="/devdocs/design/spinner"
				componentUsageStats={ this.props.getUsageStats( Spinner ) }
			>
				<p>
					<strong>Please exercise caution in deciding to use a spinner in your component.</strong>
					A lone spinner is a poor user-experience and conveys little context to what the user should expect from the page.
					Refer to <a href="/devdocs/docs/reactivity.md">the <em>Reactivity and Loading States</em> guide</a>
					for more information on building fast interfaces and making the most of data already available to use.
				</p>
				<Spinner />
			</DocsExample>
		);
	}
} );
