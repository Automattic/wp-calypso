/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryKeyringServices from 'components/data/query-keyring-services';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import InlineConnectionAction from 'my-sites/sharing/connections/inline-connection-action';
import { getKeyringServiceByName } from 'state/sharing/services/selectors';

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
