/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import EditButton from 'components/edit-button';

export default React.createClass( {
	displayName: 'Edit Button',

	mixins: [ PureRenderMixin ],

	render() {
		const post = { ID: 123 };
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/edit-button">EditButton</a>
				</h2>
				<EditButton post={ post } />
			</div>
		);
	}
} );
