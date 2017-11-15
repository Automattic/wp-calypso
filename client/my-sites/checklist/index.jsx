/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { filter, noop, range } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ChecklistHeader from './header';
import ChecklistTask from './task';
import ChecklistPlaceholder from './placeholder';

export class Checklist extends Component {
	static propTypes = {
		tasks: PropTypes.array,
		onClickTask: PropTypes.func,
		isLoading: PropTypes.bool,
	};

	static defaultProps = {
		tasks: [],
		onClickTask: noop,
		isLoading: true,
	};

	state = {
		hideCompleted: false,
	};

	toggleCompleted = () => {
		this.setState( { hideCompleted: ! this.state.hideCompleted } );
	};

	getCompletedTasks() {
		return filter( this.props.tasks, task => task.completed );
	}

	renderPlaceholder() {
		return (
			<div className={ classNames( 'checklist', 'is-expanded', 'is-placeholder' ) }>
				<ChecklistHeader total={ 0 } completed={ 0 } hideCompleted={ false } />
				{ range( 5 ).map( index => <ChecklistPlaceholder key={ index } /> ) }
			</div>
		);
	}

	render() {
		const { isLoading, onClickTask, tasks } = this.props;

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
				{ tasks.map(
					task =>
						! ( this.state.hideCompleted && task.completed ) && (
							<ChecklistTask
								key={ task.title }
								title={ task.title }
								completedTitle={ task.completedTitle }
								description={ task.description }
								duration={ task.duration }
								completed={ task.completed }
								onClick={ onClickTask }
							/>
						)
				) }
			</div>
		);
	}
}

export default connect( null, null )( Checklist );
