/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { localize, getLocaleSlug } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import titlecase from 'to-title-case';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DocumentHead from 'calypso/components/data/document-head';
import urlSearch from 'calypso/lib/url-search';
import Main from 'calypso/components/main';
import PostTypeFilter from 'calypso/my-sites/post-type-filter';
import PageList from './page-list';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import { mapPostStatus } from 'calypso/lib/route';
import { POST_STATUSES } from 'calypso/state/posts/constants';
import { getPostTypeLabel } from 'calypso/state/post-types/selectors';
import { Experiment as ExperimentPreviousClient } from 'calypso/components/experiment';

/**
 * Style dependencies
 */
import './style.scss';
import { Experiment } from 'calypso/lib/explat';

class PagesMain extends React.Component {
	static displayName = 'Pages';

	static propTypes = {
		status: PropTypes.string,
		search: PropTypes.string,
	};

	static defaultProps = {
		perPage: 20,
	};

	getAnalyticsPath() {
		const { status, siteId } = this.props;
		const basePath = '/pages';

		if ( siteId && status ) {
			return `${ basePath }/${ status }/:site`;
		}

		if ( status ) {
			return `${ basePath }/${ status }`;
		}

		if ( siteId ) {
			return `${ basePath }/:site`;
		}

		return basePath;
	}

	getAnalyticsTitle() {
		const { status } = this.props;

		if ( status && status.length ) {
			return `Pages > ${ titlecase( status ) }`;
		}

		return 'Pages > Published';
	}

	render() {
		const { siteId, search, status, translate, queryType, author } = this.props;
		const postStatus = mapPostStatus( status );

		const query = {
			number: 20, // all-sites mode, i.e the /me/posts endpoint, only supports up to 20 results at a time
			search,
			site_visibility: ! siteId ? 'visible' : undefined,
			author,
			// When searching, search across all statuses so the user can
			// always find what they are looking for, regardless of what tab
			// the search was initiated from. Use POST_STATUSES rather than
			// "any" to do this, since the latter excludes trashed posts.
			status: search ? POST_STATUSES.join( ',' ) : postStatus,
			type: queryType,
		};

		return (
			<Main wideLayout classname="pages">
				<PageViewTracker path={ this.getAnalyticsPath() } title={ this.getAnalyticsTitle() } />
				<DocumentHead title={ translate( 'Pages' ) } />
				<SidebarNavigation />
				<FormattedHeader
					brandFont
					className="pages__page-heading"
					headerText={ translate( 'Pages' ) }
					subHeaderText={ translate( 'Create, edit, and manage the pages on your site.' ) }
					align="left"
				/>
				<PostTypeFilter query={ query } siteId={ siteId } statusSlug={ status } />
				<PageList siteId={ siteId } status={ status } search={ search } query={ query } />

				{ /* ExPlat's Evergreen A/A Test Experiment:
				 *
				 * This continually starts a new experiment every week that doesn't render anything and
				 * shouldn't send any extra requests, just to help us ensure our experimentation system is
				 * working smoothly.
				 *
				 * This particular spot isn't special, it just needs somewhere to live.
				 *
				 * We use iso-week and iso-week-year in order to consistently change the experiment name every week.
				 * Assumes users have a somewhat working clock but shouldn't be a problem if they don't.
				 */ }
				<ExperimentPreviousClient
					name={ `explat_test_aa_weekly_calypso_${ moment
						.utc()
						.format( 'GGGG' ) }_week_${ moment.utc().format( 'WW' ) }` }
				/>
				<Experiment
					name={ `explat_test_aa_weekly_calypso_next_client_${ moment
						.utc()
						.format( 'GGGG' ) }_week_${ moment.utc().format( 'WW' ) }_v2` }
				>
					{ {
						treatment: null,
						default: null,
						loading: null,
					} }
				</Experiment>
			</Main>
		);
	}
}

const mapState = ( state ) => {
	const queryType = 'page';

	const siteId = getSelectedSiteId( state );

	const searchPagesPlaceholder = getPostTypeLabel(
		state,
		siteId,
		queryType,
		'search_items',
		getLocaleSlug( state )
	);

	return {
		searchPagesPlaceholder,
		queryType,
		siteId,
	};
};

export default connect( mapState )( localize( urlSearch( PagesMain ) ) );
