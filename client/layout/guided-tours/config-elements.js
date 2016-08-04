/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import {
	chunk,
	debounce,
	find,
	flatMap,
	fromPairs,
	mapValues,
	omit,
	property,
	zipObject,
} from 'lodash';

/**
 * Internal dependencies
 */
import { tracks } from 'lib/analytics';
import Card from 'components/card';
import Button from 'components/button';
import ExternalLink from 'components/external-link';
import {
	query,
	posToCss,
	getStepPosition,
	getValidatedArrowPosition,
	targetForSlug
} from './positioning';

const contextTypes = Object.freeze( {
	next: PropTypes.func.isRequired,
	quit: PropTypes.func.isRequired,
	isValid: PropTypes.func.isRequired,
	tour: PropTypes.string.isRequired,
	tourVersion: PropTypes.string.isRequired,
	step: PropTypes.string.isRequired,
	lastAction: PropTypes.object,
} );

export class Tour extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired
	}

	static childContextTypes = contextTypes;

	getChildContext() {
		const { next, quit, isValid, lastAction, tour, tourVersion, step } = this.tourMethods;
		return { next, quit, isValid, lastAction, tour, tourVersion, step };
	}

	constructor( props, context ) {
		super( props, context );
		const { next, quit, isValid, lastAction, name, version, stepName } = props;
		this.tourMethods = { next, quit, isValid, lastAction, tour: name, tourVersion: version, step: stepName };
	}

	componentWillReceiveProps( nextProps ) {
		const { next, quit, isValid, lastAction, name, version, stepName } = nextProps;
		this.tourMethods = { next, quit, isValid, lastAction, tour: name, tourVersion: version, step: stepName };
	}

	render() {
		const { children, context, isValid, lastAction, stepName } = this.props;
		const nextStep = find( children, stepComponent =>
			stepComponent.props.name === stepName );
		const isLastStep = nextStep === children[ children.length - 1 ];

		if ( ! nextStep || ! isValid( context ) ) {
			return null;
		}

		return React.cloneElement( nextStep, { isLastStep, isValid, lastAction } );
	}
}

export class Step extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
	}

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
		this.next = context.next;
		this.quit = context.quit;
		//TODO(ehg): DRY; store in object?
		this.step = context.step;
		this.tour = context.tour;
		this.tourVersion = context.tourVersion;

		this.scrollContainer = query( props.scrollContainer )[ 0 ] || global.window;
	}

	componentWillMount() {
		this.skipIfInvalidContext( this.props );
		this.setStepPosition( this.props );
	}

	componentDidMount() {
		global.window.addEventListener( 'resize', this.onScrollOrResize );
		this.scrollContainer.addEventListener( 'scroll', this.onScrollOrResize );
	}

	componentWillReceiveProps( nextProps, nextContext ) {
		this.step = nextContext.step;
		this.tour = nextContext.tour;
		this.tourVersion = nextContext.tourVersion;

		this.skipIfInvalidContext( nextProps );
		this.quitIfInvalidRoute( nextProps );
		this.setStepPosition( nextProps );
		this.scrollContainer = query( nextProps.scrollContainer )[ 0 ] || global.window;
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return this.props !== nextProps || this.state !== nextState;
	}

	componentWillUnmount() {
		global.window.removeEventListener( 'resize', this.onScrollOrResize );
		this.scrollContainer.removeEventListener( 'scroll', this.onScrollOrResize );

		const { isLastStep } = this.props;

		if ( isLastStep ) {
			tracks.recordEvent( 'calypso_guided_tours_finished', {
				step: this.step,
				tour_version: this.tourVersion,
				tour: this.tour,
			} );

			this.quit( { finished: isLastStep } );
		}
	}

	onScrollOrResize = debounce( () => {
		this.setStepPosition( this.props );
	}, 100 )

	quitIfInvalidRoute( props ) {
		const hasContinue = ( children ) => {
			// traverse children looking for a Continue element here
			const isContinue = ( child ) => {
				// console.log( '*** testing child: ', child );
				// console.log(  'typeof child', typeof child );
				// console.log(  'child.type', child.type );
				// console.log(  'child.name', child.name );
				// console.log(  'typeof child.type', typeof child.type );
				// console.log(  'child.type.name', child.type.name );

				// if ( typeof child === 'object' ) {
				// 	if ( typeof child.type === 'function' ) {

				// 	}
				// }
				return typeof child.type === 'function' && child.type.name === 'Continue';
			};
			var res = false;
			for ( const child of children ) {
				if ( res || ( isContinue( child ) ) ) {
					return true;
				} else if ( child.props && Array.isArray( child.props.children ) ) {
					res = res || hasContinue( child.props.children );
				} else if ( child.props && typeof child.props.children === 'object' ) {
					res = res || isContinue( child.props.children );
				}
			}
			return res;
		};

		console.log( 'hasContinue( this.props.children )', hasContinue( props.children ) );

		if ( props.lastAction.type === 'ROUTE_SET' ) {
			if ( ! hasContinue( props.children ) ) {
				console.log( '*********** quitting from Step.quitIfInvalidRoute' );
				this.quit();
			}
		}
	}

	skipIfInvalidContext( props ) {
		const { context, isValid } = props;
		if ( context && ! isValid( context ) ) {
			this.next( props );
		}
	}

	setStepPosition( props ) {
		const { placement, target } = props;
		const stepPos = getStepPosition( { placement, targetSlug: target } );
		const stepCoords = posToCss( stepPos );
		this.setState( { stepPos, stepCoords } );
	}

	render() {
		const { context, children, isValid } = this.props;

		if ( context && ! isValid( context ) ) {
			return null;
		}

		const { arrow, target: targetSlug } = this.props;
		const { stepCoords, stepPos } = this.state;

		const classes = [
			this.props.className,
			'guided-tours__step',
			'guided-tours__step-glow',
			targetSlug && 'guided-tours__step-pointing',
			targetSlug && 'guided-tours__step-pointing-' + getValidatedArrowPosition( {
				targetSlug,
				arrow,
				stepPos,
			} ),
		].filter( Boolean );

		return (
			<Card className={ classNames( ...classes ) } style={ stepCoords } >
				{ children }
			</Card>
		);
	}
}

export class Next extends Component {
	static propTypes = {
		step: PropTypes.string.isRequired,
		children: PropTypes.node,
	}

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
		this.next = context.next;
		//TODO(ehg): DRY; store in object?
		this.step = context.step;
		this.tour = context.tour;
		this.tourVersion = context.tourVersion;
	}

	componentWillReceiveProps( nextProps, nextContext ) {
		this.step = nextContext.step;
		this.tour = nextContext.tour;
		this.tourVersion = nextContext.tourVersion;
	}

	onClick = () => {
		tracks.recordEvent( 'calypso_guided_tours_next', {
			step: this.step,
			tour_version: this.tourVersion,
			tour: this.tour,
		} );

		this.next( this.tour, this.props.step );
	}

	render() {
		const { children } = this.props;
		return (
			<Button primary onClick={ this.onClick }>
				{ children || translate( 'Next' ) }
			</Button>
		);
	}
}

export class Quit extends Component {
	static propTypes = {
		children: PropTypes.node,
	}

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
		this.quit = context.quit;
		//TODO(ehg): DRY; store in object?
		this.step = context.step;
		this.tour = context.tour;
		this.tourVersion = context.tourVersion;
	}

	componentWillReceiveProps( nextProps, nextContext ) {
		this.step = nextContext.step;
		this.tour = nextContext.tour;
		this.tourVersion = nextContext.tourVersion;
	}

	onClick = () => {
		const { isLastStep } = this.props;

		if ( ! this.props.isLastStep ) {
			tracks.recordEvent( 'calypso_guided_tours_quit', {
				step: this.step,
				tour_version: this.tourVersion,
				tour: this.tour,
			} );
		}
		this.quit( { finished: isLastStep } );
	}

	render() {
		const { children, primary } = this.props;
		return (
			<Button onClick={ this.onClick } primary={ primary }>
				{ children || translate( 'Quit' ) }
			</Button>
		);
	}
}

var globalTimer = null;

export class Continue extends Component {
	static contextTypes = contextTypes;

	static propTypes = {
		step: PropTypes.string.isRequired,
		children: PropTypes.node,
	}

	constructor( props, context ) {
		super( props, context );
		this.lastAction = context.lastAction;
		this.isValid = context.isValid;
		this.next = context.next;
		this.isValid = context.isValid;
		//TODO(ehg): DRY; store in object?
		this.step = context.step;
		this.tour = context.tour;
		this.tourVersion = context.tourVersion;
		this.quit = context.quit;
	}

	componentDidMount() {
		! this.props.hidden && this.addTargetListener();
	}

	componentWillUnmount() {
		! this.props.hidden && this.removeTargetListener();
	}

	componentWillReceiveProps( nextProps, nextContext ) {
		this.step = nextContext.step;
		this.tour = nextContext.tour;
		this.tourVersion = nextContext.tourVersion;
		this.quitIfInvalidRoute( nextProps, nextContext );
		console.log( '++++++++++++++++++++++ globalTimer:', globalTimer );
		nextProps.context && nextContext.isValid( nextProps.context ) && this.onContinue();
	}

	componentWillUpdate( nextProps ) {
		this.removeTargetListener();
	}

	quitIfInvalidRoute( props, context ) {
		console.log( 'Continue.quitIfInvalidRoute' );
		if ( globalTimer && context.isValid( props.context ) ) {
			console.log( 'clearing timeout' );
			clearTimeout( globalTimer );
			globalTimer = null;
		}
		if ( context.lastAction && props.context && context.lastAction.type === 'ROUTE_SET' ) {
			// console.log( 'context.lastAction', context.lastAction );
			// console.log( 'context', context );
			// console.log( 'props.context', props.context );
			if ( props.context ) {
				// console.log( 'this.isValid( props.context )', this.isValid( props.context ) );
			}
			if ( ! context.isValid( props.context ) ) {
				if ( ! globalTimer ) {
					console.log( 'setting timeout' );
					const isValid = context.isValid;
					const quit = this.quit;
					globalTimer = setTimeout( function() {
						if ( ! isValid( props.context ) ) {
							quit();
						}
					}, 2000 );
				} else {
					console.log( 'there is a timeout already, not doing anything.' );
				}
				// console.log( '------------------- globalTimer', globalTimer );
				// console.log( 'new Date.getTime() - globalTimer', ( new Date().getTime() - globalTimer ) );
				// if ( ! globalTimer ) {
				// 	console.log( 'creating a timer' );
				// 	globalTimer = new Date().getTime();
				// } else if ( new Date().getTime() - globalTimer > 2000 ) {
				// 	console.log( 'calling it quits.' );
				// 	globalTimer = null;
				// 	this.quit();
				// }
				// start a global timer.
				// maybe in localStorage? state tree?
				// next time this is called, look at the timer.
				// if more than, say 2s has passed, reset timer and really quit.
				// make sure that if isValid before timer runs out, reset timer as well


				// console.log( 'looking again ...' );
				// console.log( 'this.isValid( props.context )', this.isValid( props.context ) );

				// console.log( 'looking once again ...' );
				// console.log( 'this.isValid( props.context )', this.isValid( props.context ) );

				// const contextIsValid = () => {
				// 	console.log( '+++++ contextIsValid?' );
				// 	console.log( 'props.context', props.context );
				// 	console.log( 'this.isValid( props.context )', this.isValid( props.context ) );
				// 	return this.isValid( props.context );
				// };

				// const validConfirmed = () => {
				// 	console.log( '+++++ validConfirmed!' );
				// };

				// const validErrored = () => {
				// 	console.log( '+++++ validErrored!' );
				// 	this.quit();
				// };

				// wait( { condition: contextIsValid, consequence: validConfirmed, onError: validErrored } );
				// console.log( '*********** quitting from Continue.quitIfInvalidRoute' );
				// this.quit();
			}
		}
	}

	componentDidUpdate() {
		this.addTargetListener();
	}

	onContinue = () => {
		tracks.recordEvent( 'calypso_guided_tours_next', {
			step: this.step,
			tour_version: this.tourVersion,
			tour: this.tour,
		} );

		this.next( this.tour, this.props.step );
	}

	addTargetListener() {
		const { target = false, click, context } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && ! context && targetNode && targetNode.addEventListener ) {
			targetNode.addEventListener( 'click', this.onContinue );
			targetNode.addEventListener( 'touchstart', this.onContinue );
		}
	}

	removeTargetListener() {
		const { target = false, click, context } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && ! context && targetNode && targetNode.removeEventListener ) {
			targetNode.removeEventListener( 'click', this.onContinue );
			targetNode.removeEventListener( 'touchstart', this.onContinue );
		}
	}

	render() {
		if ( this.props.hidden ) {
			return null;
		}

		return <i>{ this.props.children || translate( 'Click to continue.' ) }</i>;
	}
}

export class Link extends Component {
	constructor( props ) {
		super( props );
	}

	render() {
		return (
			<div className="guided-tours__external-link">
				<ExternalLink target="_blank" icon={ true } href={ this.props.href }>{ this.props.children }</ExternalLink>
			</div>
		);
	}
}

const branching = element => {
	if ( ! element || ! element.props ) {
		return [];
	}

	if ( element.props.step ) {
		return [ element.type.name.toLowerCase(), element.props.step ];
	}

	return flatMap(
		React.Children.toArray( element.props.children ),
		c => branching( c ) || []
	);
};

const tourBranching = tourTree => {
	const steps = React.Children
		.toArray( tourTree.props.children );

	const stepsBranching = steps
		.map( branching )
		.map( xs => chunk( xs, 2 ) )
		.map( fromPairs );

	return zipObject(
		steps.map( property( 'props.name' ) ),
		stepsBranching
	);
};

export const makeTour = tree => {
	const tour = ( { stepName, isValid, lastAction, next, quit } ) =>
		React.cloneElement( tree, { stepName, isValid, lastAction, next, quit } );

	tour.propTypes = {
		stepName: PropTypes.string.isRequired,
		isValid: PropTypes.func.isRequired,
		lastAction: PropTypes.object,
		next: PropTypes.func.isRequired,
		quit: PropTypes.func.isRequired,
	};
	tour.meta = omit( tree.props, 'children' );
	tour.branching = tourBranching( tree );
	return tour;
};

export const combineTours = tours => {
	const combined = ( props ) => {
		const tour = tours[ props.tourName ];
		return tour ? tour( props ) : null;
	};
	combined.meta = mapValues( tours, property( 'meta' ) );
	combined.branching = mapValues( tours, property( 'branching' ) );

	// FIXME(mcsf): debuggin'
	window.tours = tours;
	window.allTours = combined;

	return combined;
};
