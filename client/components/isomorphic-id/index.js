/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { incrementIsomorphicId } from 'state/ui/actions';
import { getCurrentIsomorphicId } from 'state/ui/selectors';

export default function addUniqueComponentId( Component ) {
	class ComponentWithId extends React.Component {
		constructor( props ) {
			super( props );

			this.componentId = this.props.currentIsomorphicId;
			this.props.incrementIsomorphicId();

			this.getWrappedInstance = this.getWrappedInstance.bind( this );
		}

		render() {
			return (
				<Component { ...this.props } componentId={ this.componentId } />
			);
		}
	}

	return connect(
		state => ( {
			currentIsomorphicId: getCurrentIsomorphicId( state )
		} ),
		dispatch => bindActionCreators( {
			incrementIsomorphicId
		}, dispatch )
	)( ComponentWithId );
}
