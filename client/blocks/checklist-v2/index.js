/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';

export default class Checklist extends PureComponent {
	state = { hideCompleted: false };

	render() {
		return (
			<div
				className={ classNames( 'checklist-v2', 'checklist', {
					'is-expanded': ! this.state.hideCompleted,
				} ) }
			>
				<div className="checklist-v2__items">{ this.props.children }</div>
			</div>
		);
	}
}
