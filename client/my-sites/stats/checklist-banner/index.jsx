/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Gauge from 'components/gauge';
import ProgressBar from 'components/progress-bar';

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
		onClick: PropTypes.func,
	};

	static defaultProps = {
		task: null,
		onClick: noop,
		completed: 0,
		total: 1,
	};

	handleClick = () => {
		this.props.onClick( this.task.id );
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
							a: <a href="" />,
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
				<a href="" className="checklist-banner__link">
					{ this.props.translate( 'View your checklist' ) }
				</a>
			</div>
		);
	}

	render() {
		const { completed, total, translate } = this.props;
		const task = this.getTask();
		const percentage = ( completed / total * 100 ).toFixed( 1 );

		if ( ! task ) {
			return null;
		}

		return (
			<Card className="checklist-banner">
				<Gauge
					width={ 152 }
					height={ 152 }
					lineWidth={ 18 }
					percentage={ +percentage }
					metric={ translate( 'completed' ) }
					colors={ [ '#ffffff', '#47b766' ] }
				/>
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
			</Card>
		);
	}
}

export default connect( () => {
	// The below lines will be updated to return real data
	return {
		task: {
			id: 'about',
			title: 'Create your About page',
			description:
				'It’s the first place we all go! Don’t miss the opportunity to tell people more about you and your site.',
			image: '/calypso/images/stats/tasks/about.svg',
		},
		total: 5,
		completed: 1,
	};
} )( localize( ChecklistBanner ) );
