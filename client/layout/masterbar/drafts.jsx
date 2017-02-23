/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import Popover from 'components/popover';
import Count from 'components/count';
import { getMyPostCounts } from 'state/posts/counts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQuery
} from 'state/posts/selectors';
import Draft from 'my-sites/draft';
import QueryPosts from 'components/data/query-posts';
import QueryPostCounts from 'components/data/query-post-counts';
import Button from 'components/button';
import Site from 'blocks/site';
import { getCurrentUserId } from 'state/current-user/selectors';
import sitesList from 'lib/sites-list';

const sites = sitesList();

const MasterbarDrafts = React.createClass( {
	propTypes: {
		user: React.PropTypes.object,
		sites: React.PropTypes.object,
		isActive: React.PropTypes.bool,
		className: React.PropTypes.string,
		tooltip: React.PropTypes.string,
		// connected props
		selectedSite: React.PropTypes.object,
	},

	getInitialState() {
		return {
			showDrafts: false
		};
	},

	toggleDrafts( event ) {
		event.stopPropagation();
		event.preventDefault();
		this.setState( {
			showDrafts: ! this.state.showDrafts
		} );
	},

	closeDrafts() {
		this.setState( { showDrafts: false } );
	},

	render() {
		const site = this.props.selectedSite;
		const isLoading = this.props.draftCount !== 0 && this.props.loadingDrafts;

		if ( ! site ) {
			return null;
		}

		return (
			<div>
				<QueryPostCounts siteId={ site.ID } type="post" />
				{ this.props.draftCount ?
					<Button compact borderless className="masterbar__toggle-drafts" onClick={ this.toggleDrafts } ref="drafts">
						<Count count={ this.props.draftCount } />
					</Button>
				: null }
				<Popover
					isVisible={ this.state.showDrafts }
					onClose={ this.closeDrafts }
					position="bottom left"
					context={ this.refs && this.refs.drafts }
					className="masterbar__recent-drafts"
				>
					<QueryPosts
						siteId={ site.ID }
						query={ this.props.draftsQuery } />
					<Site site={ site } />
					{ this.props.drafts && this.props.drafts.map( this.renderDraft, this ) }
					{ isLoading && <Draft isPlaceholder /> }
					{ this.props.draftCount > 6 &&
						<Button compact borderless className="masterbar__see-all-drafts" href={ `/posts/drafts/${ site.slug }` } onClick={ this.closeDrafts }>
							{ this.translate( 'See all drafts' ) }
							{ this.props.draftCount ? <Count count={ this.props.draftCount } /> : null }
						</Button>
					}
				</Popover>
			</div>
		);
	},

	renderDraft( draft ) {
		if ( ! draft ) {
			return null;
		}

		const site = this.props.selectedSite;

		return <Draft
			key={ draft.global_ID }
			post={ draft }
			sites={ sites }
			showAuthor={ site && ! site.single_user_site && ! this.props.userId }
			onTitleClick={ this.closeDrafts }
		/>;
	}
} );

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const userId = getCurrentUserId( state );
	const site = getSelectedSite( state );
	const draftsQuery = {
		type: 'post',
		status: 'draft',
		number: 10,
		order_by: 'modified',
		author: ( site && ! site.single_user_site ) ? userId : null
	};

	const myPostCounts = getMyPostCounts( state, siteId, 'post' );

	return {
		drafts: getSitePostsForQueryIgnoringPage( state, siteId, draftsQuery ),
		loadingDrafts: isRequestingSitePostsForQuery( state, siteId, draftsQuery ),
		draftsQuery: draftsQuery,
		draftCount: myPostCounts && myPostCounts.draft,
		selectedSite: site,
	};
} )( MasterbarDrafts );
