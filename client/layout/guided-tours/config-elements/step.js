/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defer, get, isFunction } from 'lodash';
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import pathToSection from 'lib/path-to-section';
import { ROUTE_SET } from 'state/action-types';
import {
	posToCss,
	getStepPosition,
	getValidatedArrowPosition,
	query,
	targetForSlug,
} from '../positioning';
import contextTypes from '../context-types';

const debug = debugFactory( 'calypso:guided-tours' );

const anyFrom = obj => {
	const key = Object.keys( obj )[ 0 ];
	return key && obj[ key ];
};

export default class Step extends Component {
	static displayName = 'Step';

	static propTypes = {
		name: PropTypes.string.isRequired,
		placement: PropTypes.oneOf( [ 'below', 'above', 'beside', 'center', 'middle', 'right' ] ),
		next: PropTypes.string,
		target: PropTypes.string,
		arrow: PropTypes.oneOf( [
			'top-left',
			'top-center',
			'top-right',
			'right-top',
			'right-middle',
			'right-bottom',
			'bottom-left',
			'bottom-center',
			'bottom-right',
			'left-top',
			'left-middle',
			'left-bottom',
		] ),
		when: PropTypes.func,
		scrollContainer: PropTypes.string,
		shouldScrollTo: PropTypes.bool,
		style: PropTypes.object,
		canSkip: PropTypes.bool,
		wait: PropTypes.func,
		onTargetDisappear: PropTypes.func,
		keepRepositioning: PropTypes.bool,
		children: PropTypes.func.isRequired,
	};

	static defaultProps = {
		canSkip: true,
	};

	static contextTypes = contextTypes;

	state = { initialized: false };

	/**
	 * A mutation observer to watch whether the target exists
	 * @type {object}
	 */
	observer = null;

	/**
	 * Flag to determine if we're repositioning the Step dialog
	 * @type {boolean} True if the Step dialog is being repositioned.
	 */
	isUpdatingPosition = false;

	componentWillMount() {
		this.wait( this.props, this.context ).then( () => {
			this.start();
			this.setStepSection( this.context, { init: true } );
			debug( 'Step#componentWillMount: stepSection:', this.stepSection );
			this.skipIfInvalidContext( this.props, this.context );
			this.scrollContainer = query( this.props.scrollContainer )[ 0 ] || window;
			this.setStepPosition( this.props );
			this.safeSetState( { initialized: true } );
		} );
	}

	componentDidMount() {
		this.mounted = true;
		this.wait( this.props, this.context ).then( () => {
			window.addEventListener( 'resize', this.onScrollOrResize );
			this.watchTarget();
		} );
		if ( this.props.keepRepositioning ) {
			this.repositionInterval = setInterval( this.onScrollOrResize, 3000 );
		}
	}

	componentWillReceiveProps( nextProps, nextContext ) {
		const shouldScrollTo = nextProps.shouldScrollTo && this.props.name !== nextProps.name;
		this.wait( nextProps, nextContext ).then( () => {
			this.setStepSection( nextContext );
			this.quitIfInvalidRoute( nextProps, nextContext );
			this.skipIfInvalidContext( nextProps, nextContext );
			this.scrollContainer.removeEventListener( 'scroll', this.onScrollOrResize );
			this.scrollContainer = query( nextProps.scrollContainer )[ 0 ] || window;
			this.scrollContainer.addEventListener( 'scroll', this.onScrollOrResize );
			this.setStepPosition( nextProps, shouldScrollTo );
			this.watchTarget();
		} );
		if ( ! nextProps.keepRepositioning ) {
			clearInterval( this.repositionInterval );
		} else if ( ! this.repositionInterval ) {
			this.repositionInterval = setInterval( this.onScrollOrResize, 3000 );
		}
	}

	componentWillUnmount() {
		this.mounted = false;
		this.safeSetState( { initialized: false } );

		window.removeEventListener( 'resize', this.onScrollOrResize );
		if ( this.scrollContainer ) {
			this.scrollContainer.removeEventListener( 'scroll', this.onScrollOrResize );
		}
		this.unwatchTarget();
		clearInterval( this.repositionInterval );
	}

	/*
	 * Needed for analytics, since GT is selector-driven
	 */
	start() {
		const { start, step, tour, tourVersion } = this.context;
		start( { step, tour, tourVersion } );
	}

	wait( props, context ) {
		if ( isFunction( props.wait ) ) {
			const ret = props.wait( props, context );
			if ( isFunction( get( ret, 'then' ) ) ) {
				return ret;
			}
		}

		return Promise.resolve();
	}

	safeSetState( state ) {
		if ( this.mounted ) {
			this.setState( state );
		} else {
			this.state = { ...this.state, ...state };
		}
	}

	watchTarget() {
		if (
			! this.props.target ||
			! this.props.onTargetDisappear ||
			typeof MutationObserver === 'undefined'
		) {
			return;
		}

		if ( ! this.observer ) {
			this.observer = new MutationObserver( () => {
				const target = document.querySelector( `[data-tip-target="${ this.props.target }"]` );
				if ( ! target ) {
					this.props.onTargetDisappear( {
						quit: () => this.context.quit( this.context ),
						next: () => this.skipToNext( this.props, this.context ),
					} );
				}
			} );
			this.observer.observe( document.body, { childList: true, subtree: true } );
		}
	}

	unwatchTarget() {
		if ( this.observer ) {
			this.observer.disconnect();
		}
	}

	/*
	 * A step belongs to a specific section. This datum is used by the "blank
	 * exit" feature (cf. Step.quitIfInvalidRoute).
	 *
	 * `setStepSection` has specific logic to deal with the fact that `step` and
	 * `section` transitions are not synchronized. Notably, navigating to a
	 * different section may trigger a route change (ROUTE_SET) before a step
	 * change (GUIDED_TOUR_UPDATE). This is further obfuscated by code
	 * splitting, because `section` doesn't transition immediately.
	 *
	 * Below, `shouldPause` tells us that we're waiting for the section to
	 * change.
	 */
	setStepSection( nextContext, { init = false } = {} ) {
		if ( init ) {
			// hard reset on Step instantiation
			this.stepSection = nextContext.sectionName;
			return;
		}

		debug(
			'Step#componentWillReceiveProps: stepSection:',
			this.stepSection,
			nextContext.sectionName
		);

		if ( this.context.step !== nextContext.step ) {
			// invalidate if waiting for section
			this.stepSection = nextContext.shouldPause ? null : nextContext.sectionName;
		} else if ( this.context.shouldPause && ! nextContext.shouldPause && ! this.stepSection ) {
			// only write if previously invalidated
			this.stepSection = nextContext.sectionName;
		}
	}

	quitIfInvalidRoute( nextProps, nextContext ) {
		if (
			nextContext.step !== this.context.step ||
			nextContext.sectionName === this.context.sectionName ||
			! nextContext.sectionName
		) {
			return;
		}

		const { step, branching, lastAction } = nextContext;
		const hasContinue = !! branching[ step ].continue;
		const hasJustNavigated = lastAction.type === ROUTE_SET;

		debug(
			'Step.quitIfInvalidRoute',
			'step',
			step,
			'previousStep',
			this.context.step,
			'hasContinue',
			hasContinue,
			'hasJustNavigated',
			hasJustNavigated,
			'lastAction',
			lastAction,
			'path',
			lastAction.path,
			'isDifferentSection',
			this.isDifferentSection( lastAction.path )
		);

		if ( ! hasContinue && hasJustNavigated && this.isDifferentSection( lastAction.path ) ) {
			defer( () => {
				debug( 'Step.quitIfInvalidRoute: quitting (different section)' );
				this.context.quit( this.context );
			} );
		}

		// quit if we have a target but cant find it
		defer( () => {
			const { quit } = this.context;
			const target = targetForSlug( this.props.target );
			if ( this.props.target && ! target ) {
				debug( 'Step.quitIfInvalidRoute: quitting (cannot find target)' );
				quit( this.context );
			} else {
				debug( 'Step.quitIfInvalidRoute: not quitting' );
			}
		} );
	}

	isDifferentSection( path ) {
		return this.stepSection && path && this.stepSection !== pathToSection( path );
	}

	skipToNext( props, context ) {
		const { branching, next, step, tour, tourVersion } = context;

		this.setAnalyticsTimestamp( context );

		const nextStepName = props.next || anyFrom( branching[ step ] );
		const skipping = this.shouldSkipAnalytics();
		next( { tour, tourVersion, step, nextStepName, skipping } );
	}

	skipIfInvalidContext( props, context ) {
		const { canSkip, when } = props;

		if ( when && ! context.isValid( when ) && canSkip ) {
			this.skipToNext( props, context );
		}
	}

	setAnalyticsTimestamp( { step, shouldPause } ) {
		if ( this.context.step !== step || ( this.context.shouldPause && ! shouldPause ) ) {
			this.lastTransitionTimestamp = Date.now();
		}
	}

	shouldSkipAnalytics() {
		return this.lastTransitionTimestamp && Date.now() - this.lastTransitionTimestamp < 500;
	}

	onScrollOrResize = () => {
		if ( ! this.isUpdatingPosition ) {
			requestAnimationFrame( () => {
				this.setStepPosition( this.props );
				this.isUpdatingPosition = false;
			} );
			this.isUpdatingPosition = true;
		}
	};

	setStepPosition( props, shouldScrollTo ) {
		const { placement, target } = props;
		const stepPos = getStepPosition( {
			placement,
			targetSlug: target,
			shouldScrollTo,
			scrollContainer: this.scrollContainer,
		} );
		const stepCoords = posToCss( stepPos );
		this.setState( { stepPos, stepCoords } );
	}

	render() {
		// `children` is a render prop where the value is not the usual JSX markup,
		// but a React component to render, i.e., function or a class.
		const { when, children: ContentComponent } = this.props;
		const { isLastStep } = this.context;

		if ( ! this.state.initialized ) {
			return null;
		}

		debug( 'Step#render' );
		if ( this.context.shouldPause ) {
			debug( 'Step: shouldPause' );
			return null;
		}

		if ( when && ! this.context.isValid( when ) ) {
			return null;
		}

		const { arrow, target: targetSlug } = this.props;
		const { stepCoords, stepPos } = this.state;

		const classes = [
			this.props.className,
			'guided-tours__step',
			'guided-tours__step-glow',
			this.context.step === 'init' && 'guided-tours__step-first',
			isLastStep && 'guided-tours__step-finish',
			targetSlug && 'guided-tours__step-pointing',
			targetSlug &&
				'guided-tours__step-pointing-' +
					getValidatedArrowPosition( {
						targetSlug,
						arrow,
						stepPos,
					} ),
		].filter( Boolean );

		const style = { ...this.props.style, ...stepCoords };

		return (
			<Card className={ classNames( ...classes ) } style={ style }>
				<ContentComponent translate={ translate } />
			</Card>
		);
	}
}
