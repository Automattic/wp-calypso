/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import AuthorSelector from '../';
import Card from 'components/card';
import observe from 'lib/mixins/data-observe';
import sites from 'lib/sites-list';
import userLib from 'lib/user';

const user = userLib();

const AuthorSelectorExample = React.createClass( {
	mixins: [ observe( 'sites' ), PureRenderMixin ],

	render() {
		const primary = this.props.sites.getPrimary();

		return (
			<div className="docs__design-assets-group">
				<h2>
					<a href="/devdocs/blocks/author-selector">Author Selector</a>
				</h2>
				<Card>
					<AuthorSelector
						siteId={ primary.ID }
						allowSingleUser
						popoverPosition="bottom"
					>
						<span>You are { user.get().display_name } </span>
					</AuthorSelector>
				</Card>
			</div>
		);
	}
} );

export default React.createClass( {
	displayName: 'AuthorSelector',

	mixins: [ PureRenderMixin ],

	render() {
		return <AuthorSelectorExample sites={ sites() } />;
	}
} );
