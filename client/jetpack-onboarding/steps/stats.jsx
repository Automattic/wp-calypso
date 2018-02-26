/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ConnectSuccess from '../connect-success';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import JetpackLogo from 'components/jetpack-logo';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySites from 'components/data/query-sites';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { addQueryArgs } from 'lib/route';
import { getJetpackOnboardingPendingSteps, getUnconnectedSiteUrl } from 'state/selectors';
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
		const { isConnected, siteUrl, translate } = this.props;
		const headerText = translate( 'Keep track of your visitors with Jetpack.' );
		const subHeaderText = translate(
			'Keep an eye on your success with simple, concise, and mobile-friendly stats. ' +
				'Get updates on site traffic, successful posts, site searches, and comments, all in real time.'
		);
		const connectUrl = addQueryArgs(
			{
				url: siteUrl,
				// TODO: add a parameter to the JPC to redirect back to this step after completion
				// and in the redirect URL include the ?action=activate_stats parameter
				// to actually trigger the stats activation action after getting back to JPO
			},
			'/jetpack/connect'
		);
		const href = ! isConnected ? connectUrl : null;

		return (
			<Fragment>
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<TileGrid>
					<Tile
						buttonLabel={ translate( 'Activate stats' ) }
						image="/calypso/images/illustrations/type-business.svg"
						onClick={ this.handleActivateStats }
						href={ href }
					/>
				</TileGrid>
			</Fragment>
		);
	}

	render() {
		const { activatedStats, basePath, getForwardUrl, siteId, translate } = this.props;

		return (
			<div className="steps__main">
				<DocumentHead title={ translate( 'Jetpack Stats ‹ Jetpack Start' ) } />
				<PageViewTracker
					path={ [ basePath, STEPS.STATS, ':site' ].join( '/' ) }
					title="Jetpack Stats ‹ Jetpack Start"
				/>
				<QuerySites siteId={ siteId } />

				<JetpackLogo full size={ 45 } />

				{ activatedStats ? (
					<ConnectSuccess
						href={ getForwardUrl() }
						illustration="/calypso/images/illustrations/type-business.svg"
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
	siteUrl: getUnconnectedSiteUrl( state, siteId ),
	stepsPending: getJetpackOnboardingPendingSteps( state, siteId, steps ),
} ) )( localize( JetpackOnboardingStatsStep ) );
