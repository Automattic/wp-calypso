/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingZones } from '../../../state/zones/selectors';
import { fetchZones } from '../../../state/zones/actions';

class QueryZones extends Component {

	componentWillMount() {
		this.fetchZones( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.siteId || this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.fetchZones( nextProps );
	}

	fetchZones( props ) {
		const { fetchingZones, siteId } = props;

		if ( ! fetchingZones && siteId ) {
			props.fetchZones( siteId );
		}
	}

	render() {
		return null;
	}
}

const connectComponent = connect(
	( state, { siteId } ) => ( { fetchingZones: isFetchingZones( state, siteId ) } ),
	{ fetchZones },
);

export default connectComponent( QueryZones );
