/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import CredentialsForm from '../credentials-form/index';

const SetupForm = ( { formIsSubmitting, reset, siteId } ) => (
	<CompactCard>
		<CredentialsForm
			{ ...{
				formIsSubmitting,
				protocol: 'ssh',
				host: '',
				port: '22',
				user: '',
				pass: '',
				abspath: '',
				kpri: '',
				onCancel: reset,
				siteId,
				showCancelButton: true,
			} }
		/>
	</CompactCard>
);

export default SetupForm;
