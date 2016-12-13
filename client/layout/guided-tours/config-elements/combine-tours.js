/**
 * External dependencies
 */
import React, { Component } from 'react';
import {
	mapValues,
	omit,
	property,
} from 'lodash';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:guided-tours' );

const combineTours = tours => (
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

export default combineTours;
