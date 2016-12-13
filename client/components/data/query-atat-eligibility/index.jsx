/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestEligibility } from 'state/automated-transfer/actions';

export class QueryAutomatedTransferEligibility extends Component {
	static propTypes = {
		requestEligibility: PropTypes.func.isRequired,
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

	request( { requestEligibility, siteId } ) {
		siteId && requestEligibility( siteId );
	}

	render() {
		return null;
	}
}

export const mapDispatchToProps = ( {
	requestEligibility,
} );

export default connect( null, mapDispatchToProps )( QueryAutomatedTransferEligibility );
