/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import {
	find,
	mapValues,
	omit,
	property,
} from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import ExternalLink from 'components/external-link';
import { tourBranching } from './config-parsing';
import {
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
} );

export class Tour extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		version: PropTypes.string,
		path: PropTypes.string,
		when: PropTypes.func,
	};

	static childContextTypes = contextTypes;

	getChildContext() {
		const { branching, next, quit, isValid, tour, tourVersion, step } = this.tourMeta;
		return { branching, next, quit, isValid, tour, tourVersion, step };
	}

	constructor( props, context ) {
		super( props, context );
		this.setTourMeta( props );
	}

	componentWillReceiveProps( nextProps ) {
		this.setTourMeta( nextProps );
	}

	setTourMeta( props ) {
		const { branching, next, quit, isValid, name, version, stepName } = props;
		this.tourMeta = { branching, next, quit, isValid, tour: name, tourVersion: version, step: stepName };
	}

	render() {
		const { children, stepName } = this.props;
		const nextStep = find( children, stepComponent =>
			stepComponent.props.name === stepName );
		const isLastStep = nextStep === children[ children.length - 1 ];

		if ( ! nextStep ) {
			return null;
		}

		return React.cloneElement( nextStep, { isLastStep } );
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

	constructor( props, context ) {
		super( props, context );
	}

	componentWillMount() {
		this.skipIfInvalidContext( this.props, this.context );
	}

	componentWillReceiveProps( nextProps, nextContext ) {
		this.skipIfInvalidContext( nextProps, nextContext );
	}

	skipIfInvalidContext( props, context ) {
		const { when, next } = props;
		if ( when && ! context.isValid( when ) ) {
			this.context.next( this.tour, next ); //TODO(ehg): use future branching code get next step
		}
	}

	render() {
		const { when, children } = this.props;

		if ( when && ! this.context.isValid( when ) ) {
			return null;
		}

		const { arrow, placement, target: targetSlug } = this.props;
		const stepPos = getStepPosition( { placement, targetSlug } );
		const stepCoords = posToCss( stepPos );

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

	onClick = () => {
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
		this.addTargetListener();
	}

	onContinue = () => {
		this.context.next( this.context.tour, this.props.step );
	}

	addTargetListener() {
		const { target = false, click, when } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && ! when && targetNode && targetNode.addEventListener ) {
			targetNode.addEventListener( 'click', this.onContinue );
		}
	}

	removeTargetListener() {
		const { target = false, click, when } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && ! when && targetNode && targetNode.removeEventListener ) {
			targetNode.removeEventListener( 'click', this.onContinue );
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
				<ExternalLink target="_blank" rel="noopener noreferrer" icon={ true } href={ this.props.href }>{ this.props.children }</ExternalLink>
			</div>
		);
	}
}

//FIXME: where do these functions belong?
export const makeTour = tree => {
	const tour = ( { stepName, isValid, next, quit } ) =>
		React.cloneElement( tree, {
			stepName, isValid, next, quit,
			branching: tourBranching( tree ),
		} );

	tour.propTypes = {
		stepName: PropTypes.string.isRequired,
		isValid: PropTypes.func.isRequired,
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

	return combined;
};
