/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import ActivityLogItem from 'my-sites/stats/activity-log-item';
import TileGrid from 'components/tile-grid';
import Tile from 'components/tile-grid/tile';
import QuerySites from 'components/data/query-sites';
import QuerySiteSettings from 'components/data/query-site-settings';
import { adjustMoment } from 'my-sites/stats/activity-log/utils';
import { requestActivityLogs } from 'state/data-getters';

class ClonePointStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	state = {
		showLog: false,
	};

	selectCurrent = () => {
		SignupActions.submitSignupStep(
			{ stepName: this.props.stepName },
			{
				clonePoint: 0,
			}
		);

		this.props.goToNextStep();
	};

	selectedPoint = activityTs => {
		SignupActions.submitSignupStep(
			{ stepName: this.props.stepName },
			{
				clonePoint: activityTs,
			}
		);

		this.props.goToNextStep();
	};

	selectPrevious = () => {
		this.setState( { showLog: true } );
	};

	applySiteOffset = moment => {
		const { timezone, gmtOffset } = this.props;
		return adjustMoment( { timezone, gmtOffset, moment } );
	};

	renderActivityLog = () => {
		const { siteId, logs, moment, translate } = this.props;

		const timePeriod = ( () => {
			const today = this.applySiteOffset( moment.utc( Date.now() ) );
			let last = null;

			return ( { rewindId } ) => {
				const ts = this.applySiteOffset( moment.utc( rewindId * 1000 ) );

				if ( null === last || ! ts.isSame( last, 'day' ) ) {
					last = ts;
					return (
						<h2 className="clone-point__time-period" key={ `time-period-${ ts }` }>
							{ ts.isSame( today, 'day' )
								? ts.format( translate( 'LL[ — Today]', { context: 'moment format string' } ) )
								: ts.format( 'LL' ) }
						</h2>
					);
				}

				return null;
			};
		} )();

		return (
			<div>
				<QuerySites siteId={ siteId } />
				<QuerySiteSettings siteId={ siteId } />
				<section className="clone-point__wrapper">
					{ logs.map( log => (
						<Fragment key={ log.activityId }>
							{ timePeriod( log ) }
							<ActivityLogItem
								key={ log.activityId }
								siteId={ siteId }
								activity={ log }
								cloneOnClick={ this.selectedPoint }
								disableRestore
								disableBackup
								hideRestore
								enableClone
							/>
						</Fragment>
					) ) }
				</section>
			</div>
		);
	};

	renderSelector = () => {
		const { translate } = this.props;

		return (
			<TileGrid>
				<Tile
					className="clone-point__current"
					buttonLabel={ translate( 'Clone current state' ) }
					description={ translate( 'Create a clone of your site as it is right now.' ) }
					image={ '/calypso/images/illustrations/clone-site-origin.svg' }
					onClick={ this.selectCurrent }
				/>
				<Tile
					className="clone-point__previous"
					buttonLabel={ translate( 'Clone previous state' ) }
					description={ translate(
						'Browse your event history and choose an earlier state to clone from.'
					) }
					image={ '/calypso/images/illustrations/backup.svg' }
					onClick={ this.selectPrevious }
				/>
			</TileGrid>
		);
	};

	renderStepContent = () => {
		return (
			<div className="clone-point__wrap">
				{ this.state.showLog ? this.renderActivityLog() : this.renderSelector() }
			</div>
		);
	};

	render() {
		const { flowName, stepName, positionInFlow, signupProgress, translate } = this.props;

		const headerText = translate( 'Clone point' );
		const subHeaderText = translate(
			"Which point in your site's history would you like to clone from?"
		);

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				positionInFlow={ positionInFlow }
				signupProgress={ signupProgress }
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = get( ownProps, [ 'signupDependencies', 'originBlogId' ] );
	const logs = siteId && requestActivityLogs( siteId, {} );

	return {
		siteId,
		logs: ( siteId && logs.data ) || [],
	};
} )( localize( ClonePointStep ) );
