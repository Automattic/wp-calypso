/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestEligibility } from 'calypso/state/automated-transfer/actions';

export class QueryAutomatedTransferEligibility extends Component {
	static propTypes = {
		requestEligibility: PropTypes.func.isRequired,
		siteId: PropTypes.number,
	};

	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( { requestEligibility, siteId } ) {
		siteId && requestEligibility( siteId );
	}

	render() {
		return null;
	}
}

export const mapDispatchToProps = {
	requestEligibility,
};

export default connect( null, mapDispatchToProps )( QueryAutomatedTransferEligibility );
