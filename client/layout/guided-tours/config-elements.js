/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import {
	debounce,
	defer,
	find,
	mapValues,
	omit,
	property,
} from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import ExternalLink from 'components/external-link';
import { ROUTE_SET } from 'state/action-types';
import { tourBranching } from './config-parsing';
import {
	posToCss,
	getStepPosition,
	getValidatedArrowPosition,
	query,
	targetForSlug,
} from './positioning';

const debug = debugFactory( 'calypso:guided-tours' );
const contextTypes = Object.freeze( {
	branching: PropTypes.object.isRequired,
	next: PropTypes.func.isRequired,
	quit: PropTypes.func.isRequired,
	isValid: PropTypes.func.isRequired,
	tour: PropTypes.string.isRequired,
	tourVersion: PropTypes.string.isRequired,
	shouldPause: PropTypes.bool.isRequired,
	step: PropTypes.string.isRequired,
	lastAction: PropTypes.object,
} );

export class Tour extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		version: PropTypes.string,
		path: PropTypes.string,
		when: PropTypes.func,
	};

	static contextTypes = contextTypes;

	render() {
		const { children } = this.props;
		const { step } = this.context;
		const nextStep = find( children, stepComponent =>
			stepComponent.props.name === step );

		return nextStep || null;
	}
}

export class Step extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		placement: PropTypes.oneOf( [
			'below', 'above', 'beside',
			'center', 'middle', 'right',
		] ),
		next: PropTypes.string,
		target: PropTypes.string,
		arrow: PropTypes.oneOf( [
			'top-left', 'top-center', 'top-right',
			'right-top', 'right-middle', 'right-bottom',
			'bottom-left', 'bottom-center', 'bottom-right',
			'left-top', 'left-middle', 'left-bottom',
		] ),
		when: PropTypes.func,
		scrollContainer: PropTypes.string,
	};

	static contextTypes = contextTypes;

	componentWillMount() {
		this.setSection();
		debug( 'Step#componentWillMount: section:', this.section );
		this.skipIfInvalidContext( this.props, this.context );
		this.scrollContainer = query( this.props.scrollContainer )[ 0 ] || global.window;
		this.setStepPosition( this.props );
	}

	componentDidMount() {
		global.window.addEventListener( 'resize', this.onScrollOrResize );
	}

	componentWillReceiveProps( nextProps, nextContext ) {
		if ( nextContext.step !== this.context.step ) {
			this.setSection();
			debug( 'Step#componentWillReceiveProps: section:', this.section );
		}

		this.skipIfInvalidContext( nextProps, nextContext );
		this.quitIfInvalidRoute( nextProps, nextContext );
		this.scrollContainer.removeEventListener( 'scroll', this.onScrollOrResize );
		this.scrollContainer = query( nextProps.scrollContainer )[ 0 ] || global.window;
		this.scrollContainer.addEventListener( 'scroll', this.onScrollOrResize );
		const shouldScrollTo = nextProps.shouldScrollTo && ( this.props.name !== nextProps.name );
		this.setStepPosition( nextProps, shouldScrollTo );
	}

	componentWillUnmount() {
		global.window.removeEventListener( 'resize', this.onScrollOrResize );
		this.scrollContainer.removeEventListener( 'scroll', this.onScrollOrResize );
	}

	setSection() {
		// keep track of current section for "blanket exit"
		// (i.e. quitIfInvalidRoute in `Step` and `Continue`)
		// TODO(mcsf,lsinger): works only in a few cases and could be more elegant
		// e.g. doesn't work when switching from reader start to discover
		// as the Step gets re-created anew
		// (better than false positives, though)
		this.section = this.pathToSection( location.pathname );
	}

	quitIfInvalidRoute( props, context ) {
		const { step, branching, lastAction } = context;
		const hasContinue = !! branching[ step ].continue;
		const hasJustNavigated = lastAction.type === ROUTE_SET;

		debug( 'Step.quitIfInvalidRoute',
			'step', step,
			'previousStep', this.context.step,
			'hasContinue', hasContinue,
			'hasJustNavigated', hasJustNavigated,
			'lastAction', lastAction,
			'path', lastAction.path,
			'isDifferentSection', this.isDifferentSection( lastAction.path ) );

		if ( ! hasContinue && hasJustNavigated &&
				this.isDifferentSection( lastAction.path ) ) {
			defer( () => {
				debug( 'Step.quitIfInvalidRoute: quitting' );
				this.context.quit();
			} );
		} else {
			debug( 'Step.quitIfInvalidRoute: not quitting' );
		}
	}

	isDifferentSection( path ) {
		debug( 'isDifferentSection', this.section, path );
		return this.section && path &&
			this.section !== this.pathToSection( path );
	}

	pathToSection( path ) {
		return path && path.split( '/' ).slice( 0, 2 ).join( '/' );
	}

	skipIfInvalidContext( props, context ) {
		const { when, next } = props;
		if ( when && ! context.isValid( when ) ) {
			this.context.next( this.tour, next );
		}
	}

	onScrollOrResize = debounce( () => {
		this.setStepPosition( this.props );
	}, 50 )

	setStepPosition( props, shouldScrollTo ) {
		const { placement, target } = props;
		const stepPos = getStepPosition( { placement, targetSlug: target, shouldScrollTo } );
		const stepCoords = posToCss( stepPos );
		this.setState( { stepPos, stepCoords } );
	}

	render() {
		const { when, children } = this.props;

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
	};

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
	}

	onClick = () => {
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
		primary: PropTypes.bool,
	};

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
	}

	onClick = ( event ) => {
		this.props.onClick && this.props.onClick( event );
		this.context.quit();
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
		children: PropTypes.node,
		click: PropTypes.bool,
		hidden: PropTypes.bool,
		icon: PropTypes.string,
		step: PropTypes.string.isRequired,
		target: PropTypes.string,
		when: PropTypes.func,
	};

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
		nextProps.when && nextContext.isValid( nextProps.when ) && this.onContinue();
	}

	componentWillUpdate() {
		this.removeTargetListener();
	}

	componentDidUpdate() {
		this.quitIfInvalidRoute( this.props, this.context );
		this.addTargetListener();
	}

	quitIfInvalidRoute( props ) {
		debug( 'Continue.quitIfInvalidRoute' );
		defer( () => {
			const quit = this.context.quit;
			const target = targetForSlug( props.target );
			// quit if we have a target but cant find it
			if ( props.target && ! target ) {
				debug( 'Continue.quitIfInvalidRoute: quitting' );
				quit();
			} else {
				debug( 'Continue.quitIfInvalidRoute: not quitting' );
			}
		} );
	}

	onContinue = () => {
		this.context.next( this.context.tour, this.props.step );
	}

	addTargetListener() {
		const { target = false, click, when } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && ! when && targetNode && targetNode.addEventListener ) {
			targetNode.addEventListener( 'click', this.onContinue );
			targetNode.addEventListener( 'touchstart', this.onContinue );
		}
	}

	removeTargetListener() {
		const { target = false, click, when } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && ! when && targetNode && targetNode.removeEventListener ) {
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
		/* eslint-disable react/jsx-no-target-blank */
		return (
			<div className="guided-tours__external-link">
				<ExternalLink target="_blank" icon={ true } href={ this.props.href }>{ this.props.children }</ExternalLink>
			</div>
		);
		/* eslint-enable react/jsx-no-target-blank */
	}
}

export const makeTour = tree => {
	return class extends Component {
		static propTypes = {
			isValid: PropTypes.func.isRequired,
			lastAction: PropTypes.object,
			next: PropTypes.func.isRequired,
			quit: PropTypes.func.isRequired,
			shouldPause: PropTypes.bool.isRequired,
			stepName: PropTypes.string.isRequired,
		};

		static childContextTypes = contextTypes;

		static meta = omit( tree.props, 'children' );

		getChildContext() {
			return this.tourMeta;
		}

		constructor( props, context ) {
			super( props, context );
			this.setTourMeta( props );
			debug( 'Anonymous#constructor', props, context );
		}

		componentWillReceiveProps( nextProps ) {
			debug( 'Anonymous#componentWillReceiveProps' );
			this.setTourMeta( nextProps );
		}

		setTourMeta( props ) {
			const { isValid, lastAction, next, quit, shouldPause, stepName } = props;
			this.tourMeta = {
				next, quit, isValid, lastAction, shouldPause,
				step: stepName,
				branching: tourBranching( tree ),
				tour: tree.props.name,
				tourVersion: tree.props.version,
			};
		}

		render() {
			return tree;
		}
	};
};

export const combineTours = tours => (
	class AllTours extends Component {
		static meta = mapValues( tours, property( 'meta' ) );
		render() {
			debug( 'AllTours#render' );
			const MyTour = tours[ this.props.tourName ];
			return MyTour
				? <MyTour { ...omit( this.props, 'tourName' ) } />
				: null;
		}
	}
);
