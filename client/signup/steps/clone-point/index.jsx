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
import { applySiteOffset } from 'lib/site/timezone';
import { Card } from '@automattic/components';
import ActivityLogItem from 'my-sites/activity/activity-log-item';
import Pagination from 'components/pagination';
import QuerySites from 'components/data/query-sites';
import QuerySiteSettings from 'components/data/query-site-settings';
import StepWrapper from 'signup/step-wrapper';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { requestActivityLogs } from 'state/data-getters';
import { getSiteOption } from 'state/sites/selectors';
import { withLocalizedMoment } from 'components/localized-moment';
import { submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

const PAGE_SIZE = 20;

class ClonePointStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	state = {
		showLog: false,
		currentPage: 1,
	};

	selectCurrent = () => {
		this.props.submitSignupStep( { stepName: this.props.stepName }, { clonePoint: 0 } );
		this.props.goToNextStep();
	};

	selectedPoint = ( activityTs ) => {
		this.props.submitSignupStep( { stepName: this.props.stepName }, { clonePoint: activityTs } );
		this.props.goToNextStep();
	};

	selectPrevious = () => {
		this.setState( { showLog: true } );
	};

	applySiteOffset( date ) {
		const { timezone, gmtOffset } = this.props;
		return applySiteOffset( date, { timezone, gmtOffset } );
	}

	changePage = ( pageNumber ) => {
		this.setState( { currentPage: pageNumber } );
		window.scrollTo( 0, 0 );
	};

	renderActivityLog() {
		const { siteId, logs, moment, translate } = this.props;

		const actualPage = Math.max(
			1,
			Math.min( this.state.currentPage, Math.ceil( logs.length / PAGE_SIZE ) )
		);

		const theseLogs = logs.slice( ( actualPage - 1 ) * PAGE_SIZE, actualPage * PAGE_SIZE );

		const timePeriod = ( () => {
			const today = this.applySiteOffset( moment() );
			let last = null;

			return ( { rewindId } ) => {
				const ts = this.applySiteOffset( moment( rewindId * 1000 ) );

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
				<Card className="clone-point__card">
					<QuerySites siteId={ siteId } />
					<QuerySiteSettings siteId={ siteId } />
					<section className="clone-point__wrapper">
						{ theseLogs.map( ( log ) => (
							<Fragment key={ log.activityId }>
								{ timePeriod( log ) }
								<ActivityLogItem
									key={ log.activityId }
									siteId={ siteId }
									activity={ log }
									cloneOnClick={ this.selectedPoint }
									disableRestore
									disableBackup
									enableClone
								/>
							</Fragment>
						) ) }
					</section>
					<Pagination
						className="clone-point__pagination"
						key="clone-point-pagination"
						nextLabel={ translate( 'Older' ) }
						page={ this.state.currentPage }
						pageClick={ this.changePage }
						perPage={ PAGE_SIZE }
						prevLabel={ translate( 'Newer' ) }
						total={ logs.length }
					/>
				</Card>
			</div>
		);
	}

	renderSelector() {
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
	}

	renderStepContent() {
		return (
			<div className="clone-point__wrap">
				{ this.state.showLog ? this.renderActivityLog() : this.renderSelector() }
			</div>
		);
	}

	render() {
		const { flowName, stepName, positionInFlow, translate } = this.props;

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
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = get( ownProps, [ 'signupDependencies', 'originBlogId' ] );
		const logs = siteId && requestActivityLogs( siteId, {} );

		return {
			siteId,
			logs: ( siteId && logs.data ) || [],
			timezone: getSiteOption( state, siteId, 'timezone' ),
			gmtOffset: getSiteOption( state, siteId, 'gmt_offset' ),
		};
	},
	{ submitSignupStep }
)( localize( withLocalizedMoment( ClonePointStep ) ) );
