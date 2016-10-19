/**
 * External dependencies
 */
import { Component, createElement } from 'react';
import { noop } from 'lodash';
import storeShape from 'react-redux/lib/utils/storeShape';

/**
 * Internal dependencies
 */
import { GUIDED_TOUR_TRACKED_CLICK } from 'state/action-types.js';

export default (
		mapPropsToAction = defaultMapPropsToAction
) => ( WrappedComponent ) => {
	class Tracked extends Component {
		constructor( props, context ) {
			super( props, context );
			const store = ( props.store || context.store );
			this.dispatch = store ? store.dispatch : noop;
		}

		onClick = ( event ) => {
			const { onClick = noop } = this.props;
			const action = mapPropsToAction( this.props );

			this.dispatch( {
				...action,
				wrapped: getDisplayName( WrappedComponent ),
				type: GUIDED_TOUR_TRACKED_CLICK,
			} );
			onClick( event );
		}

		render() {
			const { props, onClick } = this;
			return createElement( WrappedComponent, { ...props, onClick } );
		}
	}

	Tracked.displayName = `Tracked(${ getDisplayName( WrappedComponent ) })`;
	Tracked.contextTypes = { store: storeShape };
	Tracked.propTypes = { store: storeShape };

	return Tracked;
};

function defaultMapPropsToAction( /* props */ ) {
	return {};
}

// From react-redux
function getDisplayName( WrappedComponent ) {
	return WrappedComponent.displayName ||
		WrappedComponent.name ||
		'Component';
}
