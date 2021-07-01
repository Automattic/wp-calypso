/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import { Button, Card } from '@automattic/components';
import { preventWidows } from 'calypso/lib/formatting';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteChecklist from 'calypso/components/data/query-site-checklist';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';
import CardHeading from 'calypso/components/card-heading';

const BetaTesting = ( { siteId, trackViewHorizonAction } ) => {
	const translate = useTranslate();

	const header = (
		<div className="beta-testing__heading">
			<FormattedHeader
				brandFont
				headerText={ translate( 'Beta Testing' ) }
				subHeaderText={ translate( "Horizon is WordPress.com's public test environment." ) }
				align="left"
			/>
			<div className="beta-testing__view-horizon-button">
				<Button href="https://horizon.wordpress.com/" onClick={ trackViewHorizonAction }>
					{ translate( 'Visit Horizon' ) }
				</Button>
			</div>
		</div>
	);

	const main = (
		<div className="beta-testing__main">
			<Card>
				<p>
					{ translate(
						'Horizon is where the makers of WordPress.com test upcoming changes and new features with the WordPress.com community.'
					) }
				</p>

				<p>
					{ translate(
						'Be careful: things might break! If you use this testing site and volunteer to report your findings, it will help us, you, and millions of people worldwide.'
					) }
				</p>
				<p>
					{ translate(
						'We are continually blown away by how smart, creative, and insightful people are who use WordPress.com. Watch for the next testing post to come up… and please join us in testing!”'
					) }
				</p>
			</Card>
			<Card>
				<CardHeading brandFont tagName="h1" size={ 21 }>
					{ translate( 'Recent Beta Features' ) }
				</CardHeading>
				<ul></ul>
			</Card>
			<Card>
				<CardHeading brandFont tagName="h1" size={ 21 }>
					{ translate( 'How it Works' ) }
				</CardHeading>
				<ol>
					<li>
						<a href="https://horizon.wordpress.com/">{ translate( 'Visit Horizon' ) }.</a>
					</li>
					<li>{ translate( 'Select a site.' ) }</li>
				</ol>
			</Card>
		</div>
	);
	return (
		<Main wideLayout className="beta-testing__main">
			<PageViewTracker path={ `/beta-testing/:site` } title={ translate( 'Beta Testing' ) } />
			<DocumentHead title={ translate( 'Beta Testing' ) } />
			{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
			<SidebarNavigation />
			{ header }
			{ main }
		</Main>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		site: getSelectedSite( state ),
		siteId,
	};
};

const trackViewHorizonAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_beta_testing_my_site_view_horizon_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_beta_testing', 'my_site_view_horizon' )
	);

const mapDispatchToProps = {
	trackViewHorizonAction,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...ownProps,
		...stateProps,
		trackViewHorizonAction: () => dispatchProps.trackViewHorizonAction( isStaticHomePage ),
	};
};

const connectBetaTesting = connect( mapStateToProps, mapDispatchToProps, mergeProps );

export default flowRight( connectBetaTesting )( BetaTesting );
