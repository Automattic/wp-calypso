/**
 * External dependencies
 */
import storeShape from 'react-redux/lib/utils/storeShape';
import { cloneElement, Children, Component, PropTypes } from 'react';
import { constant, isFunction, noop } from 'lodash';

/**
 * Internal dependencies
 */
import deepPick from 'lib/deep-pick';
import { COMPONENT_INTERACTION_TRACKED } from 'state/action-types';

const stringShape = PropTypes.oneOfType( [
	PropTypes.string,
	PropTypes.arrayOf( PropTypes.string )
] );

export default class TrackInteractions extends Component {
	static propTypes = {
		children: PropTypes.element.isRequired,
		mapPropsToAction: PropTypes.func,
		fields: stringShape,
	}

	static defaultProps = {
		mapPropsToAction: constant( {} ),
	}

	static contextTypes = { store: storeShape };

	constructor( props, context ) {
		super( props, context );
		const store = ( props.store || context.store );
		this.dispatch = store ? store.dispatch : noop;
	}

	track = ( child ) => {
		const action = this.mapPropsToAction( child.props );

		this.dispatch( {
			type: COMPONENT_INTERACTION_TRACKED,
			eventType: 'click',
			component: child.type.name,
			...action,
		} );
	}

	mapPropsToAction( props ) {
		const { fields, mapPropsToAction } = this.props;
		return fields
			? deepPick( props, fields )
			: mapPropsToAction( props );
	}

	render() {
		const child = Children.only( this.props.children );
		const props = {
			...child.props,
			onClick: ( event ) => {
				if ( isFunction( child.props.onClick ) ) {
					child.props.onClick.call( child, event );
				}
				this.track( child );
			},
		};

		return cloneElement( child, props );
	}
}
