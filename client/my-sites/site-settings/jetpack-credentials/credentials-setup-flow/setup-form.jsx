/**
 * External dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import RewindCredentialsForm from 'components/rewind-credentials-form';

const SetupForm = ( { reset, siteId } ) => (
	<CompactCard>
		<RewindCredentialsForm
			{ ...{
				allowCancel: true,
				onCancel: reset,
				role: 'main',
				siteId,
			} }
		/>
	</CompactCard>
);

export default SetupForm;
