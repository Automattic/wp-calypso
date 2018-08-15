/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, get, noop, reduce } from 'lodash';
import Gridicon from 'gridicons';
import store from 'store';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Gauge from 'components/gauge';
import ProgressBar from 'components/progress-bar';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import { getSite, getSiteSlug } from 'state/sites/selectors';
import { launchTask, tasks } from 'my-sites/checklist/onboardingChecklist';
import ChecklistShowShare from 'my-sites/checklist/share';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

const storeKeyForNeverShow = 'sitesNeverShowChecklistBanner';

export class ChecklistBanner extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
	};

	state = {
		closed: false,
	};

	handleClick = () => {
		const { requestTour, track, siteSlug } = this.props;
		const task = this.getTask();

		launchTask( {
			task,
			location: 'checklist_banner',
			requestTour,
			siteSlug,
			track,
		} );
	};

	handleClose = () => {
		const { siteId } = this.props;
		const sitesNeverShowBanner = store.get( storeKeyForNeverShow ) || {};
		sitesNeverShowBanner[ `${ siteId }` ] = true;
		store.set( storeKeyForNeverShow, sitesNeverShowBanner );

		this.setState( { closed: true } );

		this.props.track( 'calypso_checklist_banner_close', {
			site_id: siteId,
		} );
	};

	getTask() {
		const task = find(
			tasks,
			( { id, completed } ) => ! completed && ! get( this.props.taskStatuses, [ id, 'completed' ] )
		);
		return (
			task || {
				id: 'ready-to-share',
				title: this.props.translate( 'Your site is ready to share' ),
				description: this.props.translate(
					'We did it! You have completed {{a}}all the tasks{{/a}} on our checklist.',
					{
						components: {
							a: <a href={ `/checklist/${ this.props.siteSlug }` } />,
						},
					}
				),
				image: '/calypso/images/stats/tasks/ready-to-share.svg',
			}
		);
	}

	canShow() {
		if ( this.state.closed ) {
			return false;
		}

		if ( this.props.siteDesignType !== 'blog' ) {
			return false;
		}

		const sitesNeverShowBanner = store.get( storeKeyForNeverShow );
		if ( get( sitesNeverShowBanner, String( this.props.siteId ) ) === true ) {
			return false;
		}

		return true;
	}

	renderShareButtons() {
		return (
			<ChecklistShowShare
				className="checklist-banner__actions"
				siteSlug={ this.props.siteSlug }
				recordTracksEvent={ this.props.track }
			/>
		);
	}

	renderTaskButton() {
		return (
			<div className="checklist-banner__actions">
				<Button onClick={ this.handleClick } className="checklist-banner__button" primary>
					{ this.props.translate( 'Do it' ) }
				</Button>
				<a href={ `/checklist/${ this.props.siteSlug }` } className="checklist-banner__link">
					{ this.props.translate( 'View your checklist' ) }
				</a>
			</div>
		);
	}

	render() {
		const { siteId, taskStatuses, translate } = this.props;
		const total = tasks.length;
		const completed = reduce(
			tasks,
			( count, { id, completed: taskComplete } ) =>
				taskComplete || get( taskStatuses, [ id, 'completed' ] ) ? count + 1 : count,
			0
		);
		const task = this.getTask();
		const percentage = Math.round( ( completed / total ) * 100 ) || 0;

		if ( ! this.canShow() ) {
			return null;
		}

		return (
			<Card className="checklist-banner">
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<div className="checklist-banner__gauge">
					<span className="checklist-banner__gauge-additional-text">{ translate( 'setup' ) }</span>
					<Gauge
						width={ 152 }
						height={ 152 }
						lineWidth={ 18 }
						percentage={ +percentage }
						metric={ translate( 'completed' ) }
						colors={ [ '#ffffff', '#47b766' ] }
					/>
				</div>
				<div className="checklist-banner__progress">
					<span className="checklist-banner__progress-title">{ translate( 'Site setup' ) }</span>
					<span className="checklist-banner__progress-desc">
						{ translate( '%(percentage)s%% completed', { args: { percentage } } ) }

						{ completed === total && (
							<Button
								borderless
								className="checklist-banner__close-mobile"
								onClick={ this.handleClose }
							>
								<Gridicon size={ 24 } icon="cross" color="#87a6bc" />
							</Button>
						) }
					</span>
					<ProgressBar value={ completed } total={ total } color="#47b766" />
				</div>
				<div className="checklist-banner__content">
					<h3 className="checklist-banner__title">{ task && task.title }</h3>
					<p className="checklist-banner__description">{ task && task.description }</p>
					{ completed === total ? this.renderShareButtons() : this.renderTaskButton() }
				</div>
				{ task &&
					task.image && (
						<img src={ task.image } aria-hidden="true" alt="" className="checklist-banner__image" />
					) }
				{ completed === total && (
					<Button borderless className="checklist-banner__close" onClick={ this.handleClose }>
						<Gridicon size={ 24 } icon="cross" color="#87a6bc" />
					</Button>
				) }
			</Card>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => {
	const taskStatuses = get( getSiteChecklist( state, siteId ), [ 'tasks' ] );
	const siteSlug = getSiteSlug( state, siteId );
	const siteDesignType = get( getSite( state, siteId ), [ 'options', 'design_type' ] );

	return {
		siteDesignType,
		siteSlug,
		taskStatuses,
	};
};

const mapDispatchToProps = {
	track: recordTracksEvent,
	requestTour: requestGuidedTour,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( ChecklistBanner ) );
