/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { selectStep } from 'state/ui/guided-tours/selectors';

const t = () => true;
const f = () => false;

const bindTourName = ( nextFn, tourName ) => stepName =>
	nextFn( { tour: tourName, stepName } );

export const Tour = ( { name, context, children, state, next } ) => {
	const nextStep = selectStep( state, children );
	if ( ! nextStep || ! context( state ) ) {
		return null;
	}
	return React.cloneElement( nextStep, {
		state,
		next: bindTourName( next, name )
	} );
};

Tour.propTypes = {
	name: PropTypes.string.isRequired
};

class Step extends Component {
	constructor( props ) {
		super( props );
		this.next = this.next.bind( this );
	}

	componentWillMount() {
		this.skipIfInvalidContext( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.skipIfInvalidContext( nextProps );
	}

	skipIfInvalidContext( props ) {
		const { context, state } = props;
		if ( ! context( state ) ) {
			this.next( props );
		}
	}

	next( props ) {
		const { next, nextStep } = props;
		next( nextStep );
	}

	render() {
		const { context, children, state } = this.props;
		if ( ! context( state ) ) {
			return null;
		}
		return (
			<div className="step">
				{ React.cloneElement( children, {
					next: this.next.bind( this, this.props ),
					nextStep: this.props.nextStep,
				} ) }
			</div>
		);
	}
}

Step.propTypes = {
	name: PropTypes.string.isRequired,
};

class Next extends Component {
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
				{ this.props.children }
			</button>
		);
	}
}

Next.propTypes = {
	children: PropTypes.node.isRequired,
};

export const DemoTour = ( { state, next } ) => React.cloneElement(
	<Tour name="A" context={ t }>
		<Step name="init" nextStep="C" context={ f }>
			<div>Wat</div>
		</Step>
		<Step name="C" context={ t }>
			<Next>Proceed</Next>
		</Step>
	</Tour>,
	{ state, next }
);
