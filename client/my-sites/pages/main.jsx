import { localize, getLocaleSlug } from 'i18n-calypso';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import SitePreview from 'calypso/blocks/site-preview';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { Experiment } from 'calypso/lib/explat';
import { mapPostStatus } from 'calypso/lib/route';
import urlSearch from 'calypso/lib/url-search';
import PostTypeFilter from 'calypso/my-sites/post-type-filter';
import { withJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem.js';
import { getPostTypeLabel } from 'calypso/state/post-types/selectors';
import { POST_STATUSES } from 'calypso/state/posts/constants';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageList from './page-list';

import './style.scss';

class PagesMain extends Component {
	static displayName = 'Pages';

	static propTypes = {
		status: PropTypes.string,
		search: PropTypes.string,
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
		const {
			isJetpack,
			isPossibleJetpackConnectionProblem,
			siteId,
			search,
			status,
			translate,
			queryType,
			author,
		} = this.props;
		const postStatus = mapPostStatus( status );
		/* Check if All Sites Mode */
		const isAllSites = siteId ? 1 : 0;
		const query = {
			// all-sites mode, i.e the /me/posts endpoint, only supports up to 20 results at a time
			// however, /sites/$site/posts/ endpoint used for single site supports up to 100,
			// let's utilize that to load hierarchical view by default for most of the sites
			number: siteId ? 50 : 20,
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
		const listKey = [ siteId, status, search ].join( '-' );

		return (
			<Main wideLayout classname="pages">
				<ScreenOptionsTab wpAdminPath="edit.php?post_type=page" />
				<PageViewTracker path={ this.getAnalyticsPath() } title={ this.getAnalyticsTitle() } />
				{ isJetpack && isPossibleJetpackConnectionProblem && (
					<JetpackConnectionHealthBanner siteId={ siteId } />
				) }
				<DocumentHead title={ translate( 'Pages' ) } />
				<SitePreview />
				<NavigationHeader
					navigationItems={ [] }
					title={ translate( 'Pages' ) }
					subtitle={ translate(
						'Create, edit, and manage the pages on your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						'Create, edit, and manage the pages on your sites. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							count: isAllSites,
							components: {
								learnMoreLink: <InlineSupportLink supportContext="pages" showIcon={ false } />,
							},
						}
					) }
				/>
				<PostTypeFilter query={ query } siteId={ siteId } statusSlug={ status } />
				<PageList
					key={ listKey }
					siteId={ siteId }
					status={ status }
					search={ search }
					query={ query }
				/>
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
				<Experiment
					name={ `explat_test_aa_weekly_calypso_${ moment.utc().format( 'GGGG' ) }_week_${ moment
						.utc()
						.format( 'WW' ) }` }
					defaultExperience={ null }
					treatmentExperience={ null }
					loadingExperience={ null }
				/>
				<Experiment
					name="explat_test_aaaaa_2021_08_26_18_59"
					defaultExperience={ null }
					treatmentExperience={ null }
					loadingExperience={ null }
				/>
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
		isJetpack: isJetpackSite( state, siteId ),
	};
};

export default connect( mapState )(
	localize( withJetpackConnectionProblem( urlSearch( PagesMain ) ) )
);
