/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { countBy, find, noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Gauge from 'components/gauge';
import ProgressBar from 'components/progress-bar';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { getSiteChecklist } from 'state/selectors';
import { onboardingTasks } from 'my-sites/checklist/onboardingChecklist';

export class ChecklistBanner extends Component {
	static propTypes = {
		task: PropTypes.shape( {
			id: PropTypes.string,
			title: PropTypes.string,
			description: PropTypes.string,
			image: PropTypes.string,
		} ),
		completed: PropTypes.number,
		total: PropTypes.number,
		siteId: PropTypes.number,
		slug: PropTypes.string,
		onClick: PropTypes.func,
		onClose: PropTypes.func,
	};

	static defaultProps = {
		task: null,
		onClick: noop,
		onClose: noop,
		completed: 0,
		total: 1,
	};

	handleClick = () => {
		this.props.onClick( this.task.id );
	};

	handleClose = () => {
		this.props.onClose();
	};

	getTask() {
		const { completed, total, translate } = this.props;

		if ( completed === total ) {
			return {
				id: 'ready-to-share',
				title: translate( 'Your site is ready to share' ),
				description: translate(
					'We did it! You have completed {{a}}all the tasks{{/a}} on our checklist.',
					{
						components: {
							a: <a href={ `/checklist/${ this.props.slug }` } />,
						},
					}
				),
				image: '/calypso/images/stats/tasks/ready-to-share.svg',
			};
		}

		return this.props.task;
	}

	renderShareButtons() {
		return <div className="checklist-banner__actions">Share buttons will be here!</div>;
	}

	renderTaskButton() {
		return (
			<div className="checklist-banner__actions">
				<Button onClick={ this.handleClick } className="checklist-banner__button" primary>
					{ this.props.translate( 'Do it' ) }
				</Button>
				<a href={ `/checklist/${ this.props.slug }` } className="checklist-banner__link">
					{ this.props.translate( 'View your checklist' ) }
				</a>
			</div>
		);
	}

	render() {
		const { completed, total, translate, siteId } = this.props;
		const task = this.getTask();
		const percentage = ( completed / Math.max( total, 1 ) * 100 ).toFixed( 1 );

		if ( ! task ) {
			return siteId && <QuerySiteChecklist siteId={ siteId } />;
		}

		return (
			<Card className="checklist-banner">
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
					</span>
					<ProgressBar value={ completed } total={ total } color="#47b766" />
				</div>
				<div className="checklist-banner__content">
					<h3 className="checklist-banner__title">{ task.title }</h3>
					<p className="checklist-banner__description">{ task.description }</p>
					{ completed === total ? this.renderShareButtons() : this.renderTaskButton() }
				</div>
				{ task.image && (
					<img src={ task.image } aria-hidden="true" className="checklist-banner__image" />
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

export default connect( ( state, props ) => {
	const siteChecklist = getSiteChecklist( state, props.siteId );
	const tasks = siteChecklist && siteChecklist.tasks && onboardingTasks( siteChecklist.tasks );
	const task = find( tasks, [ 'completed', false ] );
	const { true: completed } = countBy( tasks, 'completed' );

	return {
		task,
		completed,
		total: tasks && tasks.length,
	};
} )( localize( ChecklistBanner ) );
