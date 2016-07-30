/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import ExternalLink from 'components/external-link';
import { selectStep } from 'state/ui/guided-tours/selectors';
import {
	posToCss,
	getStepPosition,
	getValidatedArrowPosition,
	targetForSlug
} from './positioning';

const contextTypes = Object.freeze( {
	next: PropTypes.func.isRequired,
	quit: PropTypes.func.isRequired,
} );

export class Tour extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired
	}

	static childContextTypes = contextTypes;

	getChildContext() {
		const { next, quit } = this.tourMethods;
		return { next, quit };
	}

	constructor( props, context ) {
		super( props, context );
		const { quit, next } = props;
		this.tourMethods = { quit, next };
	}

	render() {
		const { context, children, state } = this.props;
		const nextStep = selectStep( state, children );
		if ( ! nextStep || ! context( state ) ) {
			return null;
		}

		return React.cloneElement( nextStep, { state } );
	}
}

export class Step extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
	}

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
	}

	componentWillMount() {
		this.skipIfInvalidContext( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.skipIfInvalidContext( nextProps );
	}

	skipIfInvalidContext( props ) {
		const { context, state } = props;
		if ( context && ! context( state ) ) {
			this.next( props );
		}
	}

	render() {
		const { context, children, state, placement, target } = this.props;

		if ( context && ! context( state ) ) {
			return null;
		}

		const stepPos = getStepPosition( { placement, targetSlug: target } );
		const stepCoords = posToCss( stepPos );
		const { arrow, target: targetSlug } = this.props;

		const classes = [
			'guided-tours__step',
			'guided-tours__step-glow',
			targetSlug && 'guided-tours__step-pointing',
			targetSlug && 'guided-tours__step-pointing-' + getValidatedArrowPosition( {
				targetSlug,
				arrow,
				stepPos
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
		const { children } = this.props;
		return (
			<Button onClick={ this.quit }>
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
	}

	componentDidMount() {
		this.addTargetListener();
	}

	componentWillUnmount() {
		this.removeTargetListener();
	}

	componentWillUpdate() {
		this.removeTargetListener();
	}

	componentDidUpdate() {
		this.addTargetListener();
	}

	addTargetListener() {
		const { target = false, click } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && targetNode && targetNode.addEventListener ) {
			targetNode.addEventListener( 'click', this.next );
			targetNode.addEventListener( 'touchstart', this.next );
		}
	}

	removeTargetListener() {
		const { target = false, click } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && targetNode && targetNode.removeEventListener ) {
			targetNode.removeEventListener( 'click', this.next );
			targetNode.removeEventListener( 'touchstart', this.next );
		}
	}

	render() {
		return <i>Click to continue</i>;
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
	const tour = ( { state, next, quit } ) =>
		React.cloneElement( tree, { state, next, quit } );

	tour.propTypes = {
		state: PropTypes.object.isRequired,
		next: PropTypes.func.isRequired,
		quit: PropTypes.func.isRequired,
	};

	return tour;
};
