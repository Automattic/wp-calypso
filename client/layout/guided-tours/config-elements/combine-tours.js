/**
 * External dependencies
 */
import React from 'react';

export default function combineTours( tours ) {
	return function AllTours( { tourName, ...props } ) {
		const MyTour = tours[ tourName ];
		if ( ! MyTour ) {
			return null;
		}

		return <MyTour { ...props } />;
	};
}
