/**
 * External dependencies
 */
import { cloneElement, Children, Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { constant, isFunction } from 'lodash';

/**
 * Internal dependencies
 */
import deepPick from 'lib/deep-pick';
import { COMPONENT_INTERACTION_TRACKED } from 'state/action-types';

const stringShape = PropTypes.oneOfType( [
	PropTypes.string,
	PropTypes.arrayOf( PropTypes.string )
] );

class TrackInteractions extends Component {
	static propTypes = {
		children: PropTypes.element.isRequired,
		mapPropsToAction: PropTypes.func,
		fields: stringShape,

		dispatch: PropTypes.func.isRequired,
	}

	static defaultProps = {
		mapPropsToAction: constant( {} ),
	}

	track = ( child ) => {
		const action = this.mapPropsToAction( child.props );

		this.props.dispatch( {
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

export default connect( null, null )( TrackInteractions );
