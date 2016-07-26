/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { nextGuidedTourStep } from 'state/ui/guided-tours/actions';
import { selectStep } from 'state/ui/guided-tours/selectors';

const t = () => true;
const f = () => false;

export const Config = connect(
		identity,
		{ next: nextGuidedTourStep }
)( Object.assign(
	( { state, next, children } ) => React.cloneElement( children, { state, next } ),
	{ displayName: 'GuidedToursConfig' }
) );

const magic = nextFn => tourName => stepName =>
	nextFn( { tour: tourName, stepName } );

export const Tour = ( { name, context, children, state, next } ) => {
	next = magic( next )( name );

	const nextStep = selectStep( state, children );
	if ( ! nextStep || ! context( state ) ) {
		return null;
	}
	return React.cloneElement( nextStep, { state, next } );
};

Tour.propTypes = {
	name: PropTypes.string.isRequired
};

export const Step = ( { name, context, children, state, next } ) => {
	if ( ! context( state ) ) {
		next( name );
		return null;
	}
	return (
		<div class="step">
			{ React.cloneElement( children ) }
		</div>
	);
};

Step.propTypes = {
	name: PropTypes.string.isRequired
};

export const DemoTour = (
	<Tour name="A" context={ t }>
		<Step name="init" context={ f }>
			<div>Wut</div>
		</Step>
		<Step name="C" context={ f }>
			<div>Wat</div>
		</Step>
	</Tour>
);
