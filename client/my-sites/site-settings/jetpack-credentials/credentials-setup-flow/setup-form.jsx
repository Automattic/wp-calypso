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
import CredentialsForm from '../credentials-form';

const SetupForm = ( { reset, siteId } ) => (
	<CompactCard>
		<CredentialsForm
			{ ...{
				protocol: 'ssh',
				host: '',
				port: '22',
				user: '',
				pass: '',
				path: '',
				kpri: '',
				onCancel: reset,
				role: 'main',
				siteId,
				showCancelButton: true,
			} }
		/>
	</CompactCard>
);

export default SetupForm;
