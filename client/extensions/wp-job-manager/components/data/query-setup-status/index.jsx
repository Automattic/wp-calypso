/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingSetupStatus } from '../../../state/setup/selectors';
import { fetchSetupStatus } from '../../../state/setup/actions';

class QuerySetupStatus extends Component {
	static propTypes = {
		fetchSetupStatus: PropTypes.func,
		isFetching: PropTypes.bool,
		siteId: PropTypes.number,
	};

	componentWillMount() {
		this.fetchSetupStatus( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.siteId || this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.fetchSetupStatus( nextProps );
	}

	fetchSetupStatus( props ) {
		const { isFetching, siteId } = props;

		if ( ! isFetching && siteId ) {
			props.fetchSetupStatus( siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( { isFetching: isFetchingSetupStatus( state, siteId ) } ),
	{ fetchSetupStatus }
)( QuerySetupStatus );
