import { Card } from '@automattic/components';
import clsx from 'clsx';
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';
import { defer } from 'lodash';
import { Component, CSSProperties, FunctionComponent } from 'react';
import pathToSection from 'calypso/lib/path-to-section';
import { ROUTE_SET } from 'calypso/state/action-types';
import { contextTypes } from '../context-types';
import {
	posToCss,
	getStepPosition,
	getValidatedArrowPosition,
	query,
	targetForSlug,
} from '../positioning';
import { ArrowPosition, DialogPosition, Coordinate } from '../types';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { TimestampMS } from 'calypso/types';
import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';

const debug = debugFactory( 'calypso:guided-tours' );

const anyFrom = ( obj: Record< string, string > ): string => {
	const key = Object.keys( obj )[ 0 ];
	return key && obj[ key ];
};

interface SectionContext {
	sectionName?: string;
	dispatch: CalypsoDispatch;
	step: string;
	shouldPause?: boolean;
	branching: Record< string, { continue: string } >;
	lastAction: { type: string; path: string };
	next: ( newCtx: Partial< SectionContext > ) => void;
	nextStepName?: string;
	skipping?: boolean;
	tour: string;
	tourVersion: string;
	isValid: ( when: ContextWhen ) => boolean;
	isLastStep: boolean;
	quit: ( context: Partial< SectionContext > ) => void;
	start: ( context: Partial< SectionContext > ) => void;
}

interface RequiredProps {
	name: string;
	children: FunctionComponent< { translate: typeof translate } >;
}

type ContextWhen = ( ...args: unknown[] ) => boolean;

interface AcceptedProps {
	arrow?: ArrowPosition;
	canSkip?: boolean;
	className?: string;
	dark?: boolean;
	keepRepositioning?: boolean;
	next?: string;
	onTargetDisappear?: ( callbacks: { quit?: () => void; next?: () => void } ) => void;
	placement?: DialogPosition;
	scrollContainer?: string;
	shouldScrollTo?: boolean;
	style?: CSSProperties;
	target?: string;
	wait?: () => ThunkAction< Promise< void >, unknown, void, AnyAction >;
	waitForTarget?: boolean;
	when?: ContextWhen;
}

interface DefaultProps {
	canSkip: true;
}

interface State {
	initialized?: boolean;
	hasScrolled?: boolean;
	seenTarget?: boolean;
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

	stepSection: string | null | undefined = null;

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

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		this.wait( this.props, this.context as SectionContext ).then( () => {
			this.start();
			this.setStepSection( this.context as SectionContext, { init: true } );
			debug( 'Step#componentWillMount: stepSection:', this.stepSection );
			this.skipIfInvalidContext( this.props, this.context as SectionContext );
			this.scrollContainer = query( this.props.scrollContainer ?? 'body' )[ 0 ];
			// Don't pass `shouldScrollTo` as argument since mounting hasn't occured at this point yet.
			this.setStepPosition( this.props );
			this.safeSetState( { initialized: true } );
		} );
	}

	componentDidMount() {
		this.mounted = true;
		this.wait( this.props, this.context as SectionContext ).then( () => {
			window.addEventListener( 'resize', this.onScrollOrResize );
			this.watchTarget();
		} );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps: Props, nextContext: SectionContext ) {
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
			this.scrollContainer = query( nextProps.scrollContainer ?? 'body' )[ 0 ];
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
		const { start, step, tour, tourVersion } = this.context as SectionContext;
		start( { step, tour, tourVersion } );
	}

	async wait( props: Props, context: SectionContext ) {
		if ( typeof props.wait === 'function' ) {
			await context.dispatch( props.wait() );
		}
	}

	safeSetState( state: State | ( ( state: State ) => State ) ) {
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

		this.safeSetState( { seenTarget: Boolean( ! target || targetForSlug( target ) ) } );

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
						quit: () => ( this.context as SectionContext ).quit( this.context as SectionContext ),
						next: () => this.skipToNext( this.props, this.context as SectionContext ),
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
	setStepSection( nextContext: SectionContext, { init = false } = {} ) {
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

		if ( ( this.context as SectionContext ).step !== nextContext.step ) {
			// invalidate if waiting for section
			this.stepSection = nextContext.shouldPause ? null : nextContext.sectionName;
		} else if (
			( this.context as SectionContext ).shouldPause &&
			! nextContext.shouldPause &&
			! this.stepSection
		) {
			// only write if previously invalidated
			this.stepSection = nextContext.sectionName;
		}
	}

	quitIfInvalidRoute( nextProps: Props, nextContext: SectionContext ) {
		if (
			nextContext.step !== ( this.context as SectionContext ).step ||
			nextContext.sectionName === ( this.context as SectionContext ).sectionName ||
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
			( this.context as SectionContext ).step,
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
				( this.context as SectionContext ).quit( this.context as SectionContext );
			} );
		}

		// quit if we have a target but cant find it
		defer( () => {
			const { quit } = this.context as SectionContext;
			const target = targetForSlug( this.props.target );
			if ( this.props.target && ! target ) {
				debug( 'Step.quitIfInvalidRoute: quitting (cannot find target)' );
				quit( this.context as SectionContext );
			} else {
				debug( 'Step.quitIfInvalidRoute: not quitting' );
			}
		} );
	}

	isDifferentSection( path: string ) {
		return this.stepSection && path && this.stepSection !== pathToSection( path );
	}

	skipToNext( props: Props, context: SectionContext ) {
		const { branching, next, step, tour, tourVersion } = context;

		this.setAnalyticsTimestamp( context );

		const nextStepName = props.next || anyFrom( branching[ step ] );
		const skipping = this.shouldSkipAnalytics();
		next( { tour, tourVersion, step, nextStepName, skipping } );
	}

	skipIfInvalidContext( props: Props, context: SectionContext ) {
		const { canSkip, when } = props;

		if ( when && ! context.isValid( when ) && canSkip ) {
			this.skipToNext( props, context );
		}
	}

	setAnalyticsTimestamp( { step, shouldPause }: { step: string; shouldPause?: boolean } ) {
		if (
			( this.context as SectionContext ).step !== step ||
			( ( this.context as SectionContext ).shouldPause && ! shouldPause )
		) {
			this.lastTransitionTimestamp = Date.now();
		}
	}

	shouldSkipAnalytics() {
		return Boolean(
			this.lastTransitionTimestamp && Date.now() - this.lastTransitionTimestamp < 500
		);
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
		this.safeSetState( ( state: State ) => ( {
			stepPos,
			hasScrolled: ! state.hasScrolled && scrollDiff > 0,
		} ) );
	}

	render() {
		// `children` is a render prop where the value is not the usual JSX markup,
		// but a React component to render, i.e., function or a class.
		const { when, children: ContentComponent, target, waitForTarget } = this.props;
		const { isLastStep } = this.context as SectionContext;

		if ( ! this.state.initialized ) {
			return null;
		}

		debug( 'Step#render' );
		if ( ( this.context as SectionContext ).shouldPause ) {
			debug( 'Step: shouldPause' );
			return null;
		}

		if ( when && ! ( this.context as SectionContext ).isValid( when ) ) {
			return null;
		}

		if ( target && waitForTarget && ! this.state.seenTarget ) {
			return null;
		}

		const { arrow, target: targetSlug } = this.props;
		const { stepPos = { x: 0, y: 0 } } = this.state;

		const classes = [
			this.props.className,
			'guided-tours__step',
			'guided-tours__step-glow',
			this.props.dark && 'guided-tours__step-dark',
			( this.context as SectionContext ).step === 'init' && 'guided-tours__step-first',
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
			<Card className={ clsx( ...classes ) } style={ style }>
				<ContentComponent translate={ translate } />
			</Card>
		);
	}
}
