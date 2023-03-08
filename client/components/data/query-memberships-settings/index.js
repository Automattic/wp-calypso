import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestSettings } from 'calypso/state/memberships/settings/actions';

class QueryMembershipsSettings extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestEarnings: PropTypes.func,
		source: PropTypes.string,
	};

	request() {
		if ( this.props.requesting ) {
			return;
		}

		if ( ! this.props.siteId ) {
			return;
		}

		this.props.requestSettings( this.props.siteId, this.props.source );
	}

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			this.request();
		}
	}

	render() {
		return null;
	}
}

QueryMembershipsSettings.defaultProps = {
	source: 'calypso',
};

export default connect( null, { requestSettings } )( QueryMembershipsSettings );
