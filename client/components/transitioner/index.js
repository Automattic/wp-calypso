/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';

import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

/**
 * internal dependencies
 */

export class Transitioner extends Component {
	static defaultProps = {
		direction: null,
	};

	// componentDidMount () {
	// 	const transitioner = this.refs.transitioner;
	// 	console.log( transitioner );
	// 	transitioner.addEventListener( 'animationend', this.fadingDone)
	// 	transitioner.addEventListener( 'webkitAnimationEnd', this.fadingDone)
	// }

	fadingDone() {
		console.log( 'anim done..' );
	}

	render() {
		const { direction, children, IncomingComponent } = this.props;

		const wrapperClasses = classNames( 'transitioner', {
			'transitioner__transition-right': direction === 'right',
			'transitioner__transition-left': direction === 'left',
		} );

		return (
			<ReactCSSTransitionGroup
				transitionName="sb-view-transition"
				transitionEnter={ false }
				transitionEnterTimeout={ 0 }
				transitionLeaveTimeout={ 250 }
			>
				<div className={ wrapperClasses } xref="transitioner">
					<span className="transitioner__main">{ children }</span>
					{ IncomingComponent && (
						<span className="transitioner__incoming">
							<IncomingComponent />
						</span>
					) }
				</div>
			</ReactCSSTransitionGroup>
		);
	}
}

export default Transitioner;
