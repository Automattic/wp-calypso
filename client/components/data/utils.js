/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class GenericQueryComponent extends Component {

	componentWillMount() {
		if ( ! this.props.shouldRequest ) {
			return;
		}

		this.props.request( this.props[ this.props.requestArg ] );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.shouldRequest ||
				this.props[ this.props.requestArg ] === nextProps[ nextProps.requestArg ] ) {
			return;
		}

		nextProps.request( nextProps.requestArgs );
	}

	render() {
		return null;
	}

}

GenericQueryComponent.propTypes = {
	shouldRequest: PropTypes.bool,
	request: PropTypes.func,
	requestArg: PropTypes.string,
};

export const createQueryComponent = ( {
	shouldRequest,
	shouldRequestArg,
	request,
	requestArg
} ) => connect(
	( state, ownProps ) => ( {
		shouldRequest: shouldRequest( state, ownProps[ shouldRequestArg ] ),
		requestArg,
	} ),
	( dispatch ) => bindActionCreators( { request }, dispatch ),
)( GenericQueryComponent );

