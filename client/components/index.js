/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { defer } from 'lodash';

/**
 * internal dependencies
 */

export class Transitioner extends Component {

	static defaultProps = {
		direction: 'right',
	}

	render() {
		const {
			direction,
			children,
			Comp,
			TComp
		} = this.props;

		const wrapperClasses = classNames( 'nested-sidebar__transitioner', {
			'nested-sidebar__transition-right': direction === 'right',
			'nested-sidebar__transition-left': direction === 'left',
		} );

		return (
			<div className={ wrapperClasses }>
				{ children }
				{ TComp && (
					<span className="transitioning-component">
						<TComp />
					</span>
				) }
			</div>
		);
	}
}

export default Transitioner;
