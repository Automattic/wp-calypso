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
	defer,
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
	branching: PropTypes.object.isRequired,
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
		const { branching, next, quit, isValid, lastAction, tour, tourVersion, step } = this.tourMeta;
		return { branching, next, quit, isValid, lastAction, tour, tourVersion, step };
	}

	constructor( props, context ) {
		super( props, context );
		const { branching, next, quit, isValid, lastAction, name, version, stepName } = props;
		this.tourMeta = { branching, next, quit, isValid, lastAction, tour: name, tourVersion: version, step: stepName };
	}

	componentWillReceiveProps( nextProps ) {
		const { branching, next, quit, isValid, lastAction, name, version, stepName } = nextProps;
		this.tourMeta = { branching, next, quit, isValid, lastAction, tour: name, tourVersion: version, step: stepName };
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
		this.scrollContainer = query( props.scrollContainer )[ 0 ] || global.window;

		// FIXME(mcsf): works but nasty
		this.section = this.pathToSection( location.pathname );
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
		this.skipIfInvalidContext( nextProps );
		this.quitIfInvalidRoute( nextProps, nextContext );
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
		const { quit, step, tour, tourVersion } = this.context;

		if ( isLastStep ) {
			tracks.recordEvent( 'calypso_guided_tours_finished', {
				step,
				tour,
				tour_version: tourVersion,
			} );

			quit( { finished: isLastStep } );
		}
	}

	onScrollOrResize = debounce( () => {
		this.setStepPosition( this.props );
	}, 100 )

	quitIfInvalidRoute( props, context ) {
		const { step, branching, lastAction } = context;
		const stepBranching = branching[ step ];
		const hasContinue = !! stepBranching.continue;
		const isRouteSet = lastAction.type === 'ROUTE_SET';

		console.log( 'lastAction.type', lastAction.type );
		console.log( 'hasContinue', hasContinue );

		if ( ! hasContinue && isRouteSet &&
				this.isDifferentSection( lastAction.path ) ) {
			defer( () => {
				console.log( 'Step.quitIfInvalidRoute quitting' );
				this.context.quit();
			} );
		}
	}

	isDifferentSection( path ) {
		return this.section &&
			this.section !== this.pathToSection( path );
	}

	pathToSection( path ) {
		return path.split( '/' ).slice( 0, 2 ).join( '/' );
	}

	skipIfInvalidContext( props ) {
		const { context, isValid } = props;
		if ( context && ! isValid( context ) ) {
			this.context.next( this.tour, this.nextStep() );
		}
	}

	nextStep() {
		const { branching, step } = this.context;
		const stepBranching = branching[ step ];
		const firstKey = Object.keys( stepBranching )[ 0 ];
		return stepBranching[ firstKey ];
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
	}

	onClick = () => {
		tracks.recordEvent( 'calypso_guided_tours_next', {
			step: this.context.step,
			tour_version: this.context.tourVersion,
			tour: this.context.tour,
		} );

		this.context.next( this.context.tour, this.props.step );
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
	}

	onClick = () => {
		const { isLastStep } = this.props;

		if ( ! this.props.isLastStep ) {
			tracks.recordEvent( 'calypso_guided_tours_quit', {
				step: this.context.step,
				tour_version: this.context.tourVersion,
				tour: this.context.tour,
			} );
		}
		this.context.quit( { finished: isLastStep } );
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

export class Continue extends Component {
	static contextTypes = contextTypes;

	static propTypes = {
		step: PropTypes.string.isRequired,
		children: PropTypes.node,
	}

	constructor( props, context ) {
		super( props, context );
	}

	componentDidMount() {
		! this.props.hidden && this.addTargetListener();
		this.quitIfInvalidRoute( this.props, this.context );
	}

	componentWillUnmount() {
		! this.props.hidden && this.removeTargetListener();
	}

	componentWillReceiveProps( nextProps, nextContext ) {
		// console.log( 'componentWillReceiveProps' );
		// console.log( 'nextProps', nextProps );
		// console.log( 'nextContext', nextContext );
		// this.quitIfInvalidRoute( nextProps, nextContext );
		nextProps.context && nextContext.isValid( nextProps.context ) && this.onContinue();
	}

	componentWillUpdate( nextProps ) {
		this.removeTargetListener();
	}

	componentDidUpdate(prevProps, prevState) {
		this.quitIfInvalidRoute( this.props, this.context );
	}

	quitIfInvalidRoute( props, context ) {
		console.log( 'Continue.quitIfInvalidRoute', props, context );
		/*
		- quit if we have a target but cant find it
		*/
		defer( () => {
			const quit = this.context.quit;
			const target = targetForSlug( props.target );
			if ( props.target && ! target ) {
				console.log( '++++++++ quiting from quitIfInvalidRoute' );
				quit();
			}
		} );
	}

	componentDidUpdate() {
		this.addTargetListener();
	}

	onContinue = () => {
		tracks.recordEvent( 'calypso_guided_tours_next', {
			step: this.context.step,
			tour_version: this.context.tourVersion,
			tour: this.context.tour,
		} );

		this.context.next( this.context.tour, this.props.step );
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
		React.cloneElement( tree, {
			stepName, isValid, lastAction, next, quit,
			branching: tourBranching( tree ),
		} );

	tour.propTypes = {
		stepName: PropTypes.string.isRequired,
		isValid: PropTypes.func.isRequired,
		lastAction: PropTypes.object,
		next: PropTypes.func.isRequired,
		quit: PropTypes.func.isRequired,
		branching: PropTypes.object.isRequired,
	};
	tour.meta = omit( tree.props, 'children' );
	return tour;
};

export const combineTours = tours => {
	const combined = ( props ) => {
		const tour = tours[ props.tourName ];
		return tour ? tour( props ) : null;
	};
	combined.meta = mapValues( tours, property( 'meta' ) );

	// FIXME(mcsf): debuggin'
	window.tours = tours;
	window.allTours = combined;

	return combined;
};
