/**
 * External dependencies
 */

import React, { Component } from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostShare from 'blocks/post-share';
import QueryPosts from 'components/data/query-posts';
import QuerySitePlans from 'components/data/query-site-plans';
import { getSite, getSitePlanSlug } from 'state/sites/selectors';
import { getSitePosts } from 'state/posts/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { Card } from '@automattic/components';
import QuerySites from 'components/data/query-sites';
import FormToggle from 'components/forms/form-toggle/compact';
import Notice from 'components/notice';

class PostShareExample extends Component {
	state = {
		isEnabled: false,
	};

	toggleEnable = () => this.setState( { isEnabled: ! this.state.isEnabled } );

	render() {
		const { planSlug, post, site, siteId } = this.props;

		return (
			<div>
				{ siteId && <QuerySites siteId={ siteId } /> }
				{ siteId && <QuerySitePlans siteId={ siteId } /> }
				{ siteId && <QueryPosts siteId={ siteId } query={ { number: 1, type: 'post' } } /> }

				{ site && post && (
					<p>
						Site: <strong>{ site.name }</strong> ({ siteId })<br />
						Plan: <strong>{ planSlug }</strong>
						<br />
						Post: <em>{ post.title }</em>
						<br />
					</p>
				) }

				<p onClick={ this.toggleEnable }>
					<label>
						Enabled: <FormToggle checked={ this.state.isEnabled } />
					</label>
				</p>

				{ this.state.isEnabled && (
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ `Keep in mind that you are able to share the '${ post.title }' post now. Be careful!` }
					/>
				) }

				<hr />

				<Card>
					<PostShare disabled={ ! this.state.isEnabled } post={ post } siteId={ siteId } />
				</Card>
			</div>
		);
	}
}

const ConnectedPostShareExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	const siteId = get( user, 'primary_blog' );
	const site = getSite( state, siteId );
	const posts = getSitePosts( state, siteId );
	const post = posts && posts[ posts.length - 1 ];
	const planSlug = getSitePlanSlug( state, siteId );

	return {
		siteId,
		planSlug,
		post,
		site,
	};
} )( PostShareExample );

ConnectedPostShareExample.displayName = 'PostShare';

export default ConnectedPostShareExample;
