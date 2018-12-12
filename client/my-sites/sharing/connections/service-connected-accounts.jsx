/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const SharingServiceConnectedAccounts = ( { children, connect, service, translate } ) => (
	<Fragment>
		{ 'google_plus' !== service.ID && (
			<div className="sharing-service-accounts-detail">
				<ul className="sharing-service-connected-accounts">{ children }</ul>
				{ 'publicize' === service.type && (
					<Button onClick={ connect }>
						{ translate( 'Connect a different account', {
							comment: 'Sharing: Publicize connections',
						} ) }
					</Button>
				) }
			</div>
		) }
	</Fragment>
);

SharingServiceConnectedAccounts.propTypes = {
	connect: PropTypes.func, // Handler to invoke when adding a new connection
	service: PropTypes.object.isRequired, // The service object
	translate: PropTypes.func,
};

SharingServiceConnectedAccounts.defaultProps = {
	connect: () => {},
	translate: identity,
};

export default localize( SharingServiceConnectedAccounts );
