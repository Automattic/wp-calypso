/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';

const Placeholder = ( { translate } ) => {
	return (
		<Main className="site-settings__placeholder">
			<FormattedHeader
				headerText={ translate( 'Disconnect' ) }
			/>
		<Card className="site-settings__disconnect-card">
			<div className="site-settings__placeholder-item disconnect">
				{ 'An example of a Disconnect question' }
			</div>
		</Card>
		</Main>
	);
};

export default localize( Placeholder );
