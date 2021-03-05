/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard as Card } from '@automattic/components';

const EmailForwardingGSuiteDetailsAnotherProvider = ( { translate } ) => {
	return (
		<Card className="email-forwarding__card">
			<p className="email-forwarding__explanation">
				{ translate(
					"You're using G Suite with this domain, so you'll use that to create custom email addresses. Visit your G Suite provider to manage your settings."
				) }
			</p>
		</Card>
	);
};

EmailForwardingGSuiteDetailsAnotherProvider.propTypes = {
	translate: PropTypes.func.isRequired,
};

export default localize( EmailForwardingGSuiteDetailsAnotherProvider );
