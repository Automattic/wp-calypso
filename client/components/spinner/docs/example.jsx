/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

export default React.createClass( {
	displayName: 'Spinner',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<div>
				<p>
					<strong>Please exercise caution in deciding to use a spinner in your component.</strong> A lone spinner is a poor user-experience and conveys little context to what the user should expect from the page. Refer to <a href="/devdocs/docs/reactivity.md">the <em>Reactivity and Loading States</em> guide</a> for more information on building fast interfaces and making the most of data already available to use.
				</p>
				<Spinner />
			</div>
		);
	}
} );
