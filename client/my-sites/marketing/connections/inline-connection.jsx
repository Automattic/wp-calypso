import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryKeyringServices from 'calypso/components/data/query-keyring-services';
import QueryPublicizeConnections from 'calypso/components/data/query-publicize-connections';
import InlineConnectionAction from 'calypso/my-sites/marketing/connections/inline-connection-action';
import { getKeyringServiceByName } from 'calypso/state/sharing/services/selectors';

class InlineConnection extends Component {
	static propTypes = {
		serviceName: PropTypes.string.isRequired,
	};

	render() {
		const { service } = this.props;

		return (
			<div>
				<QueryPublicizeConnections selectedSite />
				<QueryKeyringServices />

				{ service && <InlineConnectionAction service={ service } /> }
			</div>
		);
	}
}

export default connect( ( state, props ) => ( {
	service: getKeyringServiceByName( state, props.serviceName ),
} ) )( InlineConnection );
