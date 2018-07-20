/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Children, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import ChecklistHeader from 'components/checklist/header';
import ItemPlaceholder from 'components/checklist/item-placeholder';

export default class Checklist extends PureComponent {
	static propTyps = {
		completedCount: PropTypes.number,
		inferCompletedCount: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
	};

	state = { hideCompleted: false };

	toggleCompleted = () =>
		this.setState( ( { hideCompleted } ) => ( { hideCompleted: ! hideCompleted } ) );

	renderPlaceholder() {
		return (
			<div className={ classNames( 'checklist', 'is-expanded', 'is-placeholder' ) }>
				<ChecklistHeader total={ 0 } completed={ 0 } />
				{ times( Children.count( this.props.children ), index => (
					<ItemPlaceholder key={ index } />
				) ) }
			</div>
		);
	}

	render() {
		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		const { children, completedCount, inferCompletedCount } = this.props;

		const count = inferCompletedCount
			? Children.map( children, child => child.props.completed ).reduce(
					( acc, completed ) => ( true === completed ? acc + 1 : acc ),
					0
			  )
			: completedCount;

		return (
			<div
				className={ classNames( 'checklist-v2', 'checklist', {
					'is-expanded': ! this.state.hideCompleted,
					'hide-completed': this.state.hideCompleted,
				} ) }
			>
				<ChecklistHeader
					total={ Children.count( children ) }
					completed={ count }
					hideCompleted={ this.state.hideCompleted }
					onClick={ this.toggleCompleted }
				/>
				<div className="checklist-v2__items">{ children }</div>
			</div>
		);
	}
}
