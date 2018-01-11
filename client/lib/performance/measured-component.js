/** @format */
/**
 * External dependencies
 */
import * as React from 'react';
import { isEqual } from 'lodash';

const wasterRenders = {};
window.wastedRenders = wastedRenders;

function getDisplayName( WrappedComponent ) {
	return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const RENDER_COUNT = 'renderCount';
const WASTED_COUNT = 'wastedRenderCount';
const BAD_PROPS = 'bad_props';

const measuredComponent = Component => {
	return class Measured extends React.Component {
		displayName = getDisplayName( Component );

		constructor( props ) {
			super( props );
			const stats = ( wastedRenders[ this.displayName ] = {} );

			stats[ RENDER_COUNT ] = 0;
			stats[ WASTED_COUNT ] = 0;
			stats[ BAD_PROPS ] = {};
		}

		componentWillReceiveProps( nextProps ) {
			const keys = Object.keys( nextProps );
			const stats = wastedRenders[ this.displayName ];
			const badProps = stats[ BAD_PROPS ];
			let hasWaste = false;

			keys.forEach( key => {
				const deepEqual = isEqual( this.props[ key ], nextProps[ key ] );
				const shallowEqual = this.props[ key ] === nextProps[ key ];
				if ( ! shallowEqual && deepEqual ) {
					badProps[ key ] = ( badProps[ key ] || 0 ) + 1;
					hasWaste = true;
				}
			} );

			if ( hasWaste ) {
				stats[ WASTED_COUNT ] += 1;
			}
		}

		render() {
			const stats = wastedRenders[ this.displayName ];
			stats[ RENDER_COUNT ] += 1;
			return <Component { ...this.props } />;
		}
	};
};

function devOnly() {
	if ( process.env.NODE_ENV === 'production' ) {
		console.error(
			'STOP. THERE IS A DEV ONLY PERFORMANCE TOOL IN PRODUCTION ' +
				'See lib/performance/measured-component.js'
		);
		return Component => Component;
	}
	return measuredComponent;
}

export default devOnly();
