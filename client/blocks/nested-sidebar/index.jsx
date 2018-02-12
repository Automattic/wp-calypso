/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { delay, get, last, pull, invoke } from 'lodash';

/**
 * internal dependencies
 */
import { getRouteData, getRouteComponent } from './docs/access';
import NestedSidebarLink from './nested-sidebar-link';
import Transitioner from 'components/transitioner';

/*

Need to decide whether stack is inclusive of the 'current' Sidebar or just 'parent' sidebars
it's probs more semantic to have the stack be just parents.

If we're going 'back' we need to transition out the current and unmount it once the animation is done.
When we create a new incoming sidebar it should start with a class and quickly have that class removed,
triggering the transition.

// How to trigger the left transition though??

	# events
		click nested link
			start animation R-L
			end animation R-L
				transitioningInEl becomes mainEl
				transitioningOutEl is added to stack

		click back

			first in stack picked
			start animation L-R
			end animation L-R
				transitioningInEl becomes mainEl
				transitioningOutEl is unmounted

		click any other nav item
			Is it actually possible to click something outside of the nested sidebar? If we're in a nesting then those items are hidden.
			If so we'd need to reset everything :/
				How to do this arbitrarily from elements outside of the nested sidebar system?


*/

const stack = [];

let current;

export const goBack = () => {
	const lastComp = last( stack );

	pull( stack, lastComp );
	invoke( lastComp, 'slideBackFromLeft' ); // invoke will safely call (invoke) the method only if lastComp exists
	console.log( stack.length );
};

export const pushCurrentLeft = newSidebar => {
	current && stack.push( current );
	invoke( current, 'slideLeft' );

	current = newSidebar;
};

export class NestedSidebar extends Component {
	state = {
		offLeft: false,
	};

	componentWillMount() {
		pushCurrentLeft( this );
	}

	// better naming plssss
	slideLeft() {
		console.log( 'hiding', stack.length );

		this.setState( {
			offLeft: true,
		} );
	}

	// better naming plssss
	slideBackFromLeft() {
		this.setState(
			{
				offLeft: false,
			},
			() => {
				// console.log( 'after unhiding', stack.length, this.props.label )
			}
		);
	}

	componentWillUnmount() {
		if ( stack.length ) {
			console.log( 'unmounting', stack.length );
			goBack();
		}
	}

	onBack = () => {
		goBack();
		// this.slideRight()
	};

	slideRight() {}

	render() {
		const classNames = 'test-sidebar' + ( this.state.offLeft ? ' off-left' : '' );
		return (
			<div className={ classNames }>
				{ stack.length && (
					<div style={ { color: 'red' } } onClick={ this.onBack }>
						Back { stack.length }
					</div>
				) }
				{ this.props.children }
			</div>
		);
	}
}

export default NestedSidebar;

// export default connect( state => ( {
// 	route: get( state, 'sidebar.route' ),
// 	transition: get( state, 'sidebar.transition' ) || {},
// } ) )( NestedSidebar );
