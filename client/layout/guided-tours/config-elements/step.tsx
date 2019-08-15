/**
 * External dependencies
 */
import React, { Component, CSSProperties, FunctionComponent } from 'react';
import classNames from 'classnames';
import { defer, get, isEqual, isFunction } from 'lodash';
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import afterLayoutFlush from 'lib/after-layout-flush';
import pathToSection from 'lib/path-to-section';
import { ROUTE_SET } from 'state/action-types';
import {
	posToCss,
	getStepPosition,
	getValidatedArrowPosition,
	query,
	targetForSlug,
} from '../positioning';
import { contextTypes } from '../context-types';
import { ArrowPosition, DialogPosition, Coordinate } from '../types';
import { TimestampMS } from 'client/types';

const debug = debugFactory( 'calypso:guided-tours' );

const anyFrom = obj => {
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
	when?: Function;
}

interface DefaultProps {
	canSkip: true;
}

interface State {
	initialized: boolean;
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

	mounted: boolean = false;

	repositionInterval: ReturnType< typeof setInterval > | null = null;

	scrollContainer: Element | null = null;

	state: State = { initialized: false };

	/**
	 * A mutation observer to watch whether the target exists
	 */
	observer: MutationObserver | null = null;

	componentDidMount() {
		this.mounted = true;

		this.wait().then( () => {
			if ( ! this.mounted ) {
				return;
			}

			this.start();
			this.setStepSection( { init: true } );
			debug( 'Step#componentDidMount: stepSection:', this.stepSection );
			this.skipIfInvalidContext();
			this.scrollContainer = query( this.props.scrollContainer )[ 0 ] || window;
			this.setStepPosition( this.props.shouldScrollTo );
			this.setState( { initialized: true } );
			window.addEventListener( 'resize', this.onScrollOrResize );
			this.watchTarget();
		} );

		if ( this.props.keepRepositioning ) {
			this.repositionInterval = setInterval( this.onScrollOrResize, 3000 );
		}
	}

	componentDidUpdate( prevProps: Props, prevContext ) {
		this.wait().then( () => {
			if ( ! this.mounted ) {
				return;
			}

			this.setLastTransitionTimestamp( prevContext );
			this.setStepSection( { prevContext } );
			this.quitIfInvalidRoute( prevContext );
			this.skipIfInvalidContext();
			this.scrollContainer.removeEventListener( 'scroll', this.onScrollOrResize );
			this.scrollContainer = query( this.props.scrollContainer )[ 0 ] || window;
			this.scrollContainer.addEventListener( 'scroll', this.onScrollOrResize );
			const shouldScrollTo = this.props.shouldScrollTo && prevProps.name !== this.props.name;
			this.setStepPosition( shouldScrollTo );
			this.watchTarget();
		} );

		if ( ! this.props.keepRepositioning ) {
			clearInterval( this.repositionInterval );
			this.repositionInterval = null;
		} else if ( ! this.repositionInterval ) {
			this.repositionInterval = setInterval( this.onScrollOrResize, 3000 );
		}
	}

	componentWillUnmount() {
		this.mounted = false;

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

	async wait() {
		if ( ! isFunction( this.props.wait ) ) {
			return;
		}
		await this.props.wait( { reduxStore: this.context.store } );
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
				const { target, onTargetDisappear } = this.props;

				if ( ! target || ! onTargetDisappear ) {
					return;
				}

				const targetEl = document.querySelector( `[data-tip-target="${ target }"]` );
				if ( ! targetEl ) {
					onTargetDisappear( {
						quit: () => this.context.quit( this.context ),
						next: () => this.skipToNext(),
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
	setStepSection( { init = false, prevContext = null } = {} ) {
		if ( init || ! prevContext ) {
			// hard reset on Step instantiation
			this.stepSection = this.context.sectionName;
			return;
		}

		debug( 'Step#setStepSection:', init, this.stepSection, this.context.sectionName );

		if ( prevContext.step !== this.context.step ) {
			// invalidate if waiting for section
			this.stepSection = this.context.shouldPause ? null : this.context.sectionName;
		} else if ( prevContext.shouldPause && ! this.context.shouldPause && ! this.stepSection ) {
			// only write if previously invalidated
			this.stepSection = this.context.sectionName;
		}
	}

	quitIfInvalidRoute( prevContext ) {
		if (
			prevContext.step !== this.context.step ||
			prevContext.sectionName === this.context.sectionName ||
			! this.context.sectionName
		) {
			return;
		}

		const { step, branching, lastAction } = this.context;
		const hasContinue = !! branching[ step ].continue;
		const hasJustNavigated = lastAction.type === ROUTE_SET;

		debug(
			'Step.quitIfInvalidRoute',
			'step',
			step,
			'previousStep',
			prevContext.step,
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
			const target = targetForSlug( this.props.target );
			if ( this.props.target && ! target ) {
				debug( 'Step.quitIfInvalidRoute: quitting (cannot find target)' );
				this.context.quit( this.context );
			} else {
				debug( 'Step.quitIfInvalidRoute: not quitting' );
			}
		} );
	}

	isDifferentSection( path ) {
		return this.stepSection && path && this.stepSection !== pathToSection( path );
	}

	skipToNext() {
		const { branching, next, step, tour, tourVersion } = this.context;
		const nextStepName = this.props.next || anyFrom( branching[ step ] );
		const skipping = this.shouldSkipAnalytics();
		next( { tour, tourVersion, step, nextStepName, skipping } );
	}

	skipIfInvalidContext() {
		const { canSkip, when } = this.props;

		if ( when && ! this.context.isValid( when ) && canSkip ) {
			this.skipToNext();
		}
	}

	setLastTransitionTimestamp( prevContext ) {
		if (
			prevContext.step !== this.context.step ||
			( prevContext.shouldPause && ! this.context.shouldPause )
		) {
			this.lastTransitionTimestamp = Date.now();
		}
	}

	shouldSkipAnalytics() {
		return this.lastTransitionTimestamp && Date.now() - this.lastTransitionTimestamp < 500;
	}

	onScrollOrResize = afterLayoutFlush( () => this.setStepPosition() );

	setStepPosition( shouldScrollTo ) {
		const newStepPos = getStepPosition( {
			placement: this.props.placement,
			targetSlug: this.props.target,
			shouldScrollTo,
			scrollContainer: this.scrollContainer,
		} );

		this.setState( ( { stepPos } ) => {
			if ( isEqual( newStepPos, stepPos ) ) {
				return null;
			}

			return { stepPos: newStepPos };
		} );
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
