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
			IncomingComponent,
		} = this.props;

		const wrapperClasses = classNames( 'transitioner', {
			'transitioner__transition-right': direction === 'right',
			'transitioner__transition-left': direction === 'left',
		} );

		return (
			<div className={ wrapperClasses }>
				<span className="transitioner__main">
					{ children }
				</span>
				{ IncomingComponent && (
					<span className="transitioner__incoming">
						<IncomingComponent />
					</span>
				) }
			</div>
		);
	}
}

export default Transitioner;
