/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { get, map, without } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySites from 'components/data/query-sites';
import Spinner from 'components/spinner';
import {
	getJetpackOnboardingPendingSteps,
	getJetpackOnboardingCompletedSteps,
	getUnconnectedSiteUrl,
} from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import {
	JETPACK_ONBOARDING_STEP_TITLES as STEP_TITLES,
	JETPACK_ONBOARDING_STEPS as STEPS,
} from '../constants';

class JetpackOnboardingSummaryStep extends React.PureComponent {
	renderCompleted = () => {
		const { siteSlug, steps, stepsCompleted, stepsPending } = this.props;

		return map( without( steps, STEPS.SUMMARY ), stepName => {
			const isCompleted = get( stepsCompleted, stepName ) === true;
			const isPending = get( stepsPending, stepName );
			const className = classNames( 'steps__summary-entry', isCompleted ? 'completed' : 'todo' );

			return (
				<div key={ stepName } className={ className }>
					{ isPending ? (
						<Spinner size={ 18 } />
					) : (
						<Gridicon icon={ isCompleted ? 'checkmark' : 'cross' } size={ 18 } />
					) }
					<a href={ `/jetpack/onboarding/${ stepName }/${ siteSlug }` }>
						{ STEP_TITLES[ stepName ] }
					</a>
				</div>
			);
		} );
	};

	renderTodo = () => {
		const { isConnected, siteUrl, translate } = this.props;

		const stepsTodoUnconnected = {
			JETPACK_CONNECTION: {
				label: translate( 'Connect to WordPress.com' ),
				url: '/jetpack/connect?url=' + siteUrl,
			},
			THEME: {
				label: translate( 'Choose a Theme' ),
				url: siteUrl + '/wp-admin/theme-install.php?browse=featured',
			},
			PAGES: {
				label: translate( 'Add additional pages' ),
				url: siteUrl + '/wp-admin/post-new.php?post_type=page',
			},
			BLOG: {
				label: translate( 'Write your first blog post' ),
				url: siteUrl + '/wp-admin/post-new.php',
			},
		};

		// TODO: Point to Calypso
		const stepsTodoConnected = {
			THEME: {
				label: translate( 'Choose a Theme' ),
				url: siteUrl + '/wp-admin/theme-install.php?browse=featured',
			},
			PAGES: {
				label: translate( 'Add additional pages' ),
				url: siteUrl + '/wp-admin/post-new.php?post_type=page',
			},
			BLOG: {
				label: translate( 'Write your first blog post' ),
				url: siteUrl + '/wp-admin/post-new.php',
			},
		};

		const stepsTodo = isConnected ? stepsTodoConnected : stepsTodoUnconnected;

		return map( stepsTodo, ( { label, url }, stepName ) => (
			<div key={ stepName } className="steps__summary-entry todo">
				<a href={ url }>{ label }</a>
			</div>
		) );
	};

	render() {
		const { siteId, siteUrl, translate } = this.props;

		const headerText = translate( "You're ready to go!" );
		const subHeaderText = translate(
			"You've enabled Jetpack and unlocked powerful website tools that are ready for you to use. " +
				"Let's continue getting your site set up:"
		);

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Summary ‹ Jetpack Onboarding' ) } />
				<PageViewTracker
					path={ '/jetpack/onboarding/' + STEPS.SUMMARY + '/:site' }
					title="Summary ‹ Jetpack Onboarding"
				/>
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />
				<QuerySites siteId={ siteId } />

				<div className="steps__summary-columns">
					<div className="steps__summary-column">
						<h3 className="steps__summary-heading">{ translate( "Steps you've completed:" ) }</h3>
						{ this.renderCompleted() }
					</div>
					<div className="steps__summary-column">
						<h3 className="steps__summary-heading">{ translate( 'Continue your site setup:' ) }</h3>
						{ this.renderTodo() }
					</div>
				</div>
				<div className="steps__button-group">
					<Button href={ siteUrl } primary>
						{ translate( 'Visit your site' ) }
					</Button>
				</div>
			</div>
		);
	}
}

export default connect( ( state, { siteId, steps } ) => ( {
	isConnected: isJetpackSite( state, siteId ), // Will only return true if it's connected to WP.com
	siteUrl: getUnconnectedSiteUrl( state, siteId ),
	stepsCompleted: getJetpackOnboardingCompletedSteps( state, siteId, steps ),
	stepsPending: getJetpackOnboardingPendingSteps( state, siteId, steps ),
} ) )( localize( JetpackOnboardingSummaryStep ) );
