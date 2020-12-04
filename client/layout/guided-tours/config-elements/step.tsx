/**
 * External dependencies
 */
import React, { Component, CSSProperties, FunctionComponent } from 'react';
import classNames from 'classnames';
import { defer, isFunction } from 'lodash';
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import pathToSection from 'calypso/lib/path-to-section';
import { ROUTE_SET } from 'calypso/state/action-types';
import {
	posToCss,
	getStepPosition,
	getValidatedArrowPosition,
	query,
	targetForSlug,
} from '../positioning';
import { contextTypes } from '../context-types';
import { ArrowPosition, DialogPosition, Coordinate } from '../types';
import { TimestampMS } from 'calypso/types';

const debug = debugFactory( 'calypso:guided-tours' );

const anyFrom = ( obj ) => {
	const key = Object.keys( obj )[ 0 ];
	return key && obj[ key ];
};

interface RequiredProps {
	name: string;
	children: FunctionComponent< { translate: typeof translate } >;
}

interface AcceptedProps {
	arrow?: ArrowPosition;
	canSkip?: boolean;
	className?: string;
	dark?: boolean;
	keepRepositioning?: boolean;
	next?: string;
	onTargetDisappear?: Function;
	placement?: DialogPosition;
	scrollContainer?: string;
	shouldScrollTo?: boolean;
	style?: CSSProperties;
	target?: string;
	wait?: Function;
	waitForTarget?: boolean;
	when?: Function;
}

interface DefaultProps {
	canSkip: true;
}

interface State {
	initialized: boolean;
	hasScrolled: boolean;
	seenTarget: boolean;
	stepPos?: Coordinate;
}

type Props = RequiredProps & AcceptedProps & DefaultProps;

export default class Step extends Component< Props, State > {
	static displayName = 'Step';

	static defaultProps = {
		canSkip: true,
	};

	static contextTypes = contextTypes;

	lastTransitionTimestamp: TimestampMS | null = null;

	stepSection: string = null;

	mounted = false;

	repositionInterval: ReturnType< typeof setInterval > | null = null;

	scrollContainer: Element | null = null;

	state: State = {
		initialized: false,
		hasScrolled: false,
		seenTarget: false,
	};

	/**
	 * A mutation observer to watch whether the target exists
	 */
	observer: MutationObserver | null = null;

	/**
	 * Flag to determine if we're repositioning the Step dialog
	 * True if the Step dialog is being repositioned.
	 */
	isUpdatingPosition = false;

	UNSAFE_componentWillMount() {
		this.wait( this.props, this.context ).then( () => {
			this.start();
			this.setStepSection( this.context, { init: true } );
			debug( 'Step#componentWillMount: stepSection:', this.stepSection );
			this.skipIfInvalidContext( this.props, this.context );
			this.scrollContainer = query( this.props.scrollContainer )[ 0 ] || window;
			// Don't pass `shouldScrollTo` as argument since mounting hasn't occured at this point yet.
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
	}

	UNSAFE_componentWillReceiveProps( nextProps: Props, nextContext ) {
		// Scrolling must happen only once
		const shouldScrollTo = nextProps.shouldScrollTo && ! this.state.hasScrolled;

		this.wait( nextProps, nextContext ).then( () => {
			this.resetScrolledState( nextProps );
			this.setStepSection( nextContext );
			this.quitIfInvalidRoute( nextProps, nextContext );
			this.skipIfInvalidContext( nextProps, nextContext );
			if ( this.scrollContainer ) {
				this.scrollContainer.removeEventListener( 'scroll', this.onScrollOrResize );
			}
			this.scrollContainer = query( nextProps.scrollContainer )[ 0 ] || window;
			this.scrollContainer.addEventListener( 'scroll', this.onScrollOrResize );
			this.setStepPosition( nextProps, shouldScrollTo );
			this.watchTarget();
		} );
	}

	componentWillUnmount() {
		this.mounted = false;
		this.safeSetState( { initialized: false } );

		window.removeEventListener( 'resize', this.onScrollOrResize );
		if ( this.scrollContainer ) {
			this.scrollContainer.removeEventListener( 'scroll', this.onScrollOrResize );
		}
		this.unwatchTarget();
	}

	/*
	 * Needed for analytics, since GT is selector-driven
	 */
	start() {
		const { start, step, tour, tourVersion } = this.context;
		start( { step, tour, tourVersion } );
	}

	async wait( props: Props, context ) {
		if ( isFunction( props.wait ) ) {
			await context.dispatch( props.wait() );
		}
	}

	safeSetState( state: State ) {
		if ( this.mounted ) {
			this.setState( state );
		} else {
			this.state = { ...this.state, ...state };
		}
	}

	watchTarget() {
		const { target, onTargetDisappear, waitForTarget, keepRepositioning } = this.props;
		if (
			( ! keepRepositioning && ( ! target || ( ! onTargetDisappear && ! waitForTarget ) ) ) ||
			typeof window === 'undefined' ||
			typeof window.MutationObserver === 'undefined'
		) {
			return;
		}

		this.safeSetState( { seenTarget: ! target || targetForSlug( target ) } );

		if ( ! this.observer ) {
			this.observer = new window.MutationObserver( () => {
				if ( keepRepositioning ) {
					this.onScrollOrResize();
				}

				// This is checking that we have a target and that we
				// either want to wait for it to appear, or invoke a callback
				// when it disappears. If not, then there's nothing for us to do!
				if ( ! target || ( ! waitForTarget && ! onTargetDisappear ) ) {
					return;
				}

				const targetEl = targetForSlug( target );
				// If the target isn't found and we want to invoke a callback when
				// it disappears, then check that we've either previously seen the target
				// or that we've not been waiting to see it. If so, invoke the callback.
				// Otherwise, if the target is in the DOM update our state to show that
				// it's been seen.
				if ( ! targetEl && onTargetDisappear && ( ! waitForTarget || this.state.seenTarget ) ) {
					debug( 'Step#watchTarget: Target has disappeared' );
					onTargetDisappear( {
						quit: () => this.context.quit( this.context ),
						next: () => this.skipToNext( this.props, this.context ),
					} );
				} else if ( targetEl ) {
					this.safeSetState( { seenTarget: true } );
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

	quitIfInvalidRoute( nextProps: Props, nextContext ) {
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

	skipToNext( props: Props, context ) {
		const { branching, next, step, tour, tourVersion } = context;

		this.setAnalyticsTimestamp( context );

		const nextStepName = props.next || anyFrom( branching[ step ] );
		const skipping = this.shouldSkipAnalytics();
		next( { tour, tourVersion, step, nextStepName, skipping } );
	}

	skipIfInvalidContext( props: Props, context ) {
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
		if ( this.mounted && ! this.isUpdatingPosition ) {
			window.requestAnimationFrame( () => {
				this.setStepPosition( this.props );
				this.isUpdatingPosition = false;
			} );
			this.isUpdatingPosition = true;
		}
	};

	resetScrolledState( nextProps: Props ) {
		const { name } = this.props;
		const { name: nextName } = nextProps;

		// Reinitialize scrolling behaviour when step changes
		if ( nextName !== name ) {
			this.safeSetState( { hasScrolled: false } );
		}
	}

	setStepPosition( props: Props, shouldScrollTo = false ) {
		const { placement, target } = props;
		const { stepPos, scrollDiff } = getStepPosition( {
			placement,
			targetSlug: target,
			shouldScrollTo,
			scrollContainer: this.scrollContainer,
		} );
		this.safeSetState( ( state ) => ( {
			stepPos,
			hasScrolled: ! state.hasScrolled && scrollDiff > 0,
		} ) );
	}

	render() {
		// `children` is a render prop where the value is not the usual JSX markup,
		// but a React component to render, i.e., function or a class.
		const { when, children: ContentComponent, target, waitForTarget } = this.props;
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

		if ( target && waitForTarget && ! this.state.seenTarget ) {
			return null;
		}

		const { arrow, target: targetSlug } = this.props;
		const { stepPos } = this.state;

		const classes = [
			this.props.className,
			'guided-tours__step',
			'guided-tours__step-glow',
			this.props.dark && 'guided-tours__step-dark',
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

		const style = { ...this.props.style, ...posToCss( stepPos ) };

		return (
			<Card className={ classNames( ...classes ) } style={ style }>
				<ContentComponent translate={ translate } />
			</Card>
		);
	}
}
