/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import { requestEligibility } from 'state/automated-transfer/actions';

export class QueryAutomatedTransferEligibility extends Component {
	static propTypes = {
		request: PropTypes.func.isRequired,
		siteId: PropTypes.number,
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( { request, siteId } ) {
		siteId && request( siteId );
	}

	render() {
		return null;
	}
}

export const mapDispatchToProps = dispatch => ( {
	request: compose( dispatch, requestEligibility ),
} );

export default connect( null, mapDispatchToProps )( QueryAutomatedTransferEligibility );
