/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getKeyringServiceByName } from 'client/state/sharing/services/selectors';
import QueryKeyringServices from 'client/components/data/query-keyring-services';
import QueryPublicizeConnections from 'client/components/data/query-publicize-connections';
import InlineConnectionAction from 'client/my-sites/sharing/connections/inline-connection-action';

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
