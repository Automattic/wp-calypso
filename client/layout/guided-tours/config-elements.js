/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { selectStep } from 'state/ui/guided-tours/selectors';
import { posToCss, getStepPosition, getValidatedArrowPosition } from './positioning';

const bindTourName = ( nextFn, tourName ) => stepName =>
	nextFn( { tour: tourName, stepName } );

export class Tour extends Component {
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

Tour.propTypes = {
	name: PropTypes.string.isRequired
};

Tour.childContextTypes = {
	next: PropTypes.func.isRequired,
	quit: PropTypes.func.isRequired,
};

export class Step extends Component {
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
		const { context, children, state } = this.props;

		if ( context && ! context( state ) ) {
			return null;
		}

		const stepPos = getStepPosition( this.props );
		const stepCoords = posToCss( stepPos );
		const { targetSlug, arrow } = this.props;

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

Step.propTypes = {
	name: PropTypes.string.isRequired,
};

Step.contextTypes = {
	next: PropTypes.func.isRequired,
	quit: PropTypes.func.isRequired,
};

export class Next extends Component {
	constructor( props, context ) {
		super( props, context );
		this.next = context.next;
	}

	render() {
		const { children, translate } = this.props;
		return (
			<Button primary onClick={ this.next }>
				{ children || translate( 'Next' ) }
			</Button>
		);
	}
}

Next.propTypes = {
	children: PropTypes.node,
};

Next.contextTypes = {
	next: PropTypes.func.isRequired,
	quit: PropTypes.func.isRequired,
};

export class Quit extends Component {
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
}

Quit.propTypes = {
	children: PropTypes.node,
};

Quit.contextTypes = {
	next: PropTypes.func.isRequired,
	quit: PropTypes.func.isRequired,
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
