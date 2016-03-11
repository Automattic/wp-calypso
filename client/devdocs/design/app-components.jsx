/**
* External dependencies
*/
import React from 'react';
import page from 'page';
import toTitleCase from 'to-title-case';
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import SearchCard from 'components/search-card';
import CommentButtons from 'components/comment-button/docs/example';
import PostSelector from 'my-sites/post-selector/docs/example';
import LikeButtons from 'components/like-button/docs/example';
import FollowButtons from 'components/follow-button/docs/example';
import Sites from 'lib/sites-list/docs/example';
import SitesDropdown from 'components/sites-dropdown/docs/example';
import Theme from 'components/theme/docs/example';
import PostSchedule from 'components/post-schedule/docs/example';
import HeaderCake from 'components/header-cake';
import Collection from 'devdocs/design/search-collection';
import HappinessSupport from 'components/happiness-support/docs/example';

export default React.createClass( {
	displayName: 'AppComponents',

	getInitialState() {
		return { filter: '' };
	},

	onSearch( term ) {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	},

	backToComponents() {
		page( '/devdocs/app-components/' );
	},

	render() {
		return (
			<div className="design-assets" role="main">
				<h1>App Components</h1>
				<p>A visual reference for all application components used in Calypso.</p>
				{
					this.props.component
					? <HeaderCake onClick={ this.backToComponents } backText="All App Components">
						{ toTitleCase( this.props.component ) }
					</HeaderCake>
					: <SearchCard
						onSearch={ this.onSearch }
						initialValue={ this.state.filter }
						placeholder="Search app components…"
						analyticsGroup="Docs">
					</SearchCard>
				}
				<Collection component={ this.props.component } filter={ this.state.filter }>
					<CommentButtons />
					<FollowButtons />
					<HappinessSupport />
					<LikeButtons />
					<PostSchedule />
					<PostSelector />
					<Sites />
					<SitesDropdown />
					<Theme />
				</Collection>
			</div>
		);
	}
} );
