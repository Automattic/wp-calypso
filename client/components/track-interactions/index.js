/**
 * External dependencies
 */
import { cloneElement, Children, Component, PropTypes } from 'react';
import { constant, isFunction } from 'lodash';

/**
 * Internal dependencies
 */
import connectOptional from 'lib/connect-optional';
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
		// connected
		trackInteraction: PropTypes.func.isRequired,
	}

	static defaultProps = {
		mapPropsToAction: constant( {} ),
	}

	track = ( child ) => {
		this.props.trackInteraction(
			child.type.name,
			this.mapPropsToAction( child.props )
		);
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

function trackInteraction( componentName, data ) {
	return {
		type: COMPONENT_INTERACTION_TRACKED,
		eventType: 'click',
		component: componentName,
		...data,
	};
}

export default connectOptional(
	null,
	{ trackInteraction }
)( TrackInteractions );
