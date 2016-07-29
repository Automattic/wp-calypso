/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { selectStep } from 'state/ui/guided-tours/selectors';

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
		this.next = this.next.bind( this );
		this.quit = this.quit.bind( this );
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

	next( props ) {
		const { next, nextStep } = props;
		next( nextStep );
	}

	quit( props ) {
		const { quit } = props;
		quit( /** finished **/ );
	}

	render() {
		console.log( this.props );
		const { context, children, state } = this.props;
		if ( context && ! context( state ) ) {
			return null;
		}
		return (
			<div className="guided-tours__step">
				{ React.Children.map( children, ( child ) =>
						React.cloneElement( child, {
						next: this.next.bind( this, this.props ),
						quit: this.quit.bind( this, this.props ),
						nextStep: this.props.nextStep,
					} ) )
				}
			</div>
		);
	}
}

Step.propTypes = {
	name: PropTypes.string.isRequired,
};

export class Next extends Component {
	constructor( props ) {
		super( props );
		console.log( 'props', this.props );
		this.next = this.next.bind( this );
	}

	next() {
		const { next, nextStep } = this.props;
		console.log( 'next', next, this.props );
		next( nextStep );
	}

	render() {
		console.log( 'props', this.props );
		return (
			<button className="next" onClick={ this.props.next }>
				{ this.props.children || 'Next' }
			</button>
		);
	}
}

Next.propTypes = {
	children: PropTypes.node.isRequired,
};

export class Quit extends Component {
	constructor( props ) {
		super( props );
		this.quit = this.quit.bind( this );
	}

	quit() {
		const { quit } = this.props;
		quit( /** finished **/ );
	}

	render() {
		console.log( 'props', this.props );
		return (
			<button className="next" onClick={ this.props.quit }>
				{ this.props.children || 'Quit' }
			</button>
		);
	}
}

Next.propTypes = {
	children: PropTypes.node.isRequired,
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
