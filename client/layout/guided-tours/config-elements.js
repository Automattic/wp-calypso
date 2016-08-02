/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { find, debounce } from 'lodash';

/**
 * Internal dependencies
 */
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
} );

export class Tour extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired
	}

	static childContextTypes = contextTypes;

	getChildContext() {
		const { next, quit, isValid } = this.tourMethods;
		return { next, quit, isValid };
	}

	constructor( props, context ) {
		super( props, context );
		const { next, quit, isValid } = props;
		this.tourMethods = { next, quit, isValid };
	}

	componentWillReceiveProps( nextProps ) {
		const { next, quit, isValid } = nextProps;
		this.tourMethods = { next, quit, isValid };
	}

	render() {
		const { context, children, isValid, stepName } = this.props;
		const nextStep = find( children, stepComponent =>
			stepComponent.props.name === stepName );

		if ( ! nextStep || ! isValid( context ) ) {
			return null;
		}

		return React.cloneElement( nextStep, { isValid } );
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

	componentWillReceiveProps( nextProps ) {
		this.skipIfInvalidContext( nextProps );
		this.setStepPosition( nextProps );
		this.scrollContainer = query( nextProps.scrollContainer )[ 0 ] || global.window;
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return this.props !== nextProps || this.state !== nextState;
	}

	componentWillUnmount() {
		global.window.removeEventListener( 'resize', this.onScrollOrResize );
		this.scrollContainer.removeEventListener( 'scroll', this.onScrollOrResize );
	}

	onScrollOrResize = debounce( () => {
		this.setStepPosition( this.props );
	}, 100 )

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
		children: PropTypes.node,
	}

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
		this.next = context.next;
	}

	render() {
		const { children } = this.props;
		return (
			<Button primary onClick={ this.next }>
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
	}

	render() {
		const { children, primary } = this.props;
		return (
			<Button onClick={ this.quit } primary={ primary }>
				{ children || translate( 'Quit' ) }
			</Button>
		);
	}
}

export class Continue extends Component {
	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
		this.next = context.next;
		this.isValid = context.isValid;
	}

	componentDidMount() {
		! this.props.hidden && this.addTargetListener();
	}

	componentWillUnmount() {
		! this.props.hidden && this.removeTargetListener();
	}

	componentWillReceiveProps( nextProps, nextContext ) {
		nextProps.context && nextContext.isValid( nextProps.context ) && this.next();
	}

	componentWillUpdate() {
		this.removeTargetListener();
	}

	componentDidUpdate() {
		this.addTargetListener();
	}

	addTargetListener() {
		const { target = false, click, context } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && ! context && targetNode && targetNode.addEventListener ) {
			targetNode.addEventListener( 'click', this.next );
			targetNode.addEventListener( 'touchstart', this.next );
		}
	}

	removeTargetListener() {
		const { target = false, click, context } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && ! context && targetNode && targetNode.removeEventListener ) {
			targetNode.removeEventListener( 'click', this.next );
			targetNode.removeEventListener( 'touchstart', this.next );
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

export const makeTour = tree => {
	const tour = ( { stepName, isValid, next, quit } ) =>
		React.cloneElement( tree, { stepName, isValid, next, quit } );

	tour.propTypes = {
		stepName: PropTypes.string.isRequired,
		isValid: PropTypes.func.isRequired,
		next: PropTypes.func.isRequired,
		quit: PropTypes.func.isRequired,
	};

	return tour;
};

export const combineTours = tours => ( props ) => {
	const tour = tours[ props.tourName ];
	return tour ? tour( props ) : null;
};
