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

	state = {
		animate: false,
		direction: 'right',
	};

	componentDidMount() {
		const { direction, children } = this.props;
		// console.log( 'componentDidMount', direction )

		// if (true) {}

		setTimeout( () => {
			this.setState( {
				transitioning: true,
			} );
		}, 1 )

		// isnt being repeated
	}

	componentWillUpdate( { direction, tcomp } ) {
		// console.log( {
		// 	tcomp,
		// 	pC: this.props.tcomp,
		// 	direction,
		// 	pD: this.props.direction
		// } );

		// console.log(
		// 	! this.props.direction && direction
		// 		? 'transitioning:' + direction
		// 		: 'no anim'
		// )



		if ( ! this.props.direction && direction ) {
			this.setState( {
				transitioning: false,
				direction,
			} )
		}

	}

	render() {
		const {
			direction,
			children,
			Comp,
			TComp
		} = this.props;
		const {
			transitioning,
			// direction
		} = this.state;

		const wrapperClasses = classNames( 'nested-sidebar__transitioner', {
			// 'nested-sidebar__transition-right': true,
			'nested-sidebar__transition-right': direction === 'right',
			'nested-sidebar__transition-left': direction === 'left',
			'transitioning': transitioning,
		} );

		const transitioningClasses = classNames( 'transitioning-component', {
			// 'transitioning': transitioning,
		} );

		// console.log( {
		// 	direction,
		// 	transitioning,
		// } );

		return (
			<div className={ wrapperClasses }>
				{ children }
				{ TComp && (
					<span className={ transitioningClasses }>
						<TComp />
					</span>
				) }
			</div>
		);
	}
}

export default Transitioner;
