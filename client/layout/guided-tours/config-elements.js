/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { selectStep } from 'state/ui/guided-tours/selectors';
import { posToCss, getStepPosition, getValidatedArrowPosition, targetForSlug } from './positioning';

const bindTourName = ( nextFn, tourName ) => stepName =>
	nextFn( { tour: tourName, stepName } );

export const Tour = ( { name, context, children, state, next, quit } ) => {
	console.log( 'tour state ', state );
	console.log( 'tour props ', next, quit );
	const nextStep = selectStep( state, children );
	if ( ! nextStep || ! context( state ) ) {
		return null;
	}

	return React.cloneElement( nextStep, {
		state,
		quit,
		next: bindTourName( next, name )
	} );
};

Tour.propTypes = {
	name: PropTypes.string.isRequired
};

export class Step extends Component {
	constructor( props ) {
		super( props );
	}

	componentWillMount() {
		console.log( 'state', this.props.state );
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

	next = ( props = this.props ) => {
		const { next, nextStep } = props;
		next( nextStep );
	}

	quit = ( props = this.props ) => {
		const { quit } = props;
		quit( /** finished **/ );
	}

	render() {
		const { context, children, state } = this.props;

		if ( context && ! context( state ) ) {
			return null;
		}

		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );
		const { text, onNext, onQuit, targetSlug, arrow } = this.props;

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
				{ React.Children.map( children, ( child ) =>
						React.cloneElement( child, {
						next: this.next,
						quit: this.quit,
						nextStep: this.props.nextStep,
					} ) )
				}
			</Card>
		);
	}
}

Step.propTypes = {
	name: PropTypes.string.isRequired,
};

export const Next = localize( class Next extends Component {
	constructor( props ) {
		super( props );
	}

	next = () => {
		const { next, nextStep } = this.props;
		console.log( 'next', next, this.props );
		next( nextStep );
	}

	render() {
		const { children, translate } = this.props;
		return (
			<Button primary onClick={ this.next }>
				{ children || translate( 'Next' ) }
			</Button>
		);
	}
} );

Next.propTypes = {
	children: PropTypes.node,
};

export const Quit = localize( class Quit extends Component {
	constructor( props ) {
		super( props );
	}

	quit = () => {
		const { quit } = this.props;
		quit( /** finished **/ );
	}

	render() {
		const { children, translate } = this.props;
		return (
			<Button onClick={ this.quit }>
				{ children || translate( 'Quit' ) }
			</Button>
		);
	}
} );

Quit.propTypes = {
	children: PropTypes.node,
};

export class Continue extends Component {
	constructor( props ) {
		super( props );
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
		return <a>Some link</a>;
	}
}
