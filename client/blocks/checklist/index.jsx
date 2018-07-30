/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { filter, noop, times } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ChecklistHeader from './checklist-header';
import ChecklistTask from './checklist-task';
import ChecklistPlaceholder from './checklist-placeholder';
import { loadTrackingTool } from 'state/analytics/actions';

export class Checklist extends Component {
	static propTypes = {
		tasks: PropTypes.array,
		onAction: PropTypes.func,
		onToggle: PropTypes.func,
		isLoading: PropTypes.bool,
		placeholderCount: PropTypes.number,
	};

	static defaultProps = {
		tasks: [],
		onAction: noop,
		onToggle: noop,
		isLoading: true,
		placeholderCount: 5,
	};

	state = {
		hideCompleted: false,
	};

	componentDidMount() {
		this.props.loadTrackingTool( 'HotJar' );
	}

	toggleCompleted = () => {
		this.setState( { hideCompleted: ! this.state.hideCompleted } );
	};

	getCompletedTasks() {
		return filter( this.props.tasks, task => task.completed );
	}

	getUncompletedTasks() {
		return filter( this.props.tasks, task => ! task.completed );
	}

	renderPlaceholder() {
		return (
			<div className={ classNames( 'checklist', 'is-expanded', 'is-placeholder' ) }>
				<ChecklistHeader total={ 0 } completed={ 0 } hideCompleted={ false } />
				{ times( this.props.placeholderCount, index => (
					<ChecklistPlaceholder key={ index } />
				) ) }
			</div>
		);
	}

	renderTask = task => {
		return (
			<ChecklistTask
				buttonPrimary={ task.buttonPrimary }
				buttonText={ task.buttonText }
				completed={ task.completed }
				completedButtonText={ task.completedButtonText }
				completedTitle={ task.completedTitle }
				description={ task.description }
				duration={ task.duration }
				id={ task.id }
				key={ task.id }
				onAction={ this.props.onAction }
				onToggle={ this.props.onToggle }
				title={ task.title }
			/>
		);
	};

	render() {
		const { isLoading, tasks } = this.props;

		if ( isLoading ) {
			return this.renderPlaceholder();
		}

		return (
			<div className={ classNames( 'checklist', { 'is-expanded': ! this.state.hideCompleted } ) }>
				<ChecklistHeader
					total={ tasks.length }
					completed={ this.getCompletedTasks().length }
					hideCompleted={ this.state.hideCompleted }
					onClick={ this.toggleCompleted }
				/>
				{ ! this.state.hideCompleted && this.getCompletedTasks().map( this.renderTask ) }
				{ this.getUncompletedTasks().map( this.renderTask ) }
			</div>
		);
	}
}

export default connect(
	null,
	{ loadTrackingTool }
)( Checklist );
