/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ConnectIntro from '../connect-intro';
import ConnectSuccess from '../connect-success';
import FormattedHeader from 'components/formatted-header';
import JetpackLogo from 'components/jetpack-logo';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySites from 'components/data/query-sites';
import { getJetpackOnboardingPendingSteps } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { JETPACK_ONBOARDING_STEPS as STEPS } from '../constants';

class JetpackOnboardingStatsStep extends React.Component {
	componentDidUpdate() {
		this.maybeActivateStats();
	}

	maybeActivateStats() {
		const { action, activatedStats, isConnected, isRequestingSettings, stepsPending } = this.props;
		const isPending = get( stepsPending, STEPS.STATS );

		if (
			! isPending &&
			! isRequestingSettings &&
			isConnected &&
			activatedStats === false &&
			action === 'activate_stats'
		) {
			this.activateStats();
		}
	}

	handleActivateStats = () => {
		this.props.recordJpoEvent( 'calypso_jpo_stats_clicked' );

		if ( ! this.props.isConnected ) {
			return;
		}

		this.activateStats();
	};

	handleStatsNextButton = () => {
		this.props.recordJpoEvent( 'calypso_jpo_stats_next_clicked' );
	};

	activateStats() {
		this.props.saveJpoSettings( this.props.siteId, {
			stats: true,
		} );
	}

	renderActionTile() {
		const { siteId, translate } = this.props;
		const header = (
			<FormattedHeader
				headerText={ translate( 'Keep track of your visitors with Jetpack.' ) }
				subHeaderText={ translate(
					'Keep an eye on your success with simple, concise, and mobile-friendly stats. ' +
						'Get updates on site traffic, successful posts, site searches, and comments, all in real time.'
				) }
			/>
		);

		return (
			<ConnectIntro
				action="activate_stats"
				buttonLabel={ translate( 'Activate stats' ) }
				e2eType="activate-stats"
				header={ header }
				illustration="/calypso/images/illustrations/jetpack-stats.svg"
				onClick={ this.handleActivateStats }
				siteId={ siteId }
			/>
		);
	}

	render() {
		const { activatedStats, basePath, getForwardUrl, siteId, translate } = this.props;

		return (
			<div className="steps__main">
				<PageViewTracker
					path={ [ basePath, STEPS.STATS, ':site' ].join( '/' ) }
					title="Jetpack Stats ‹ Jetpack Start"
				/>
				<QuerySites siteId={ siteId } />

				<JetpackLogo full size={ 45 } />

				{ activatedStats ? (
					<ConnectSuccess
						href={ getForwardUrl() }
						illustration="/calypso/images/illustrations/jetpack-stats.svg"
						onClick={ this.handleStatsNextButton }
						title={ translate( 'Success! Jetpack is now collecting valuable stats.' ) }
					/>
				) : (
					this.renderActionTile()
				) }
			</div>
		);
	}
}

export default connect( ( state, { settings, siteId, steps } ) => ( {
	activatedStats: get( settings, 'stats' ) === true,
	isConnected: isJetpackSite( state, siteId ),
	stepsPending: getJetpackOnboardingPendingSteps( state, siteId, steps ),
} ) )( localize( JetpackOnboardingStatsStep ) );
