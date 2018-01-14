/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import CredentialsForm from '../credentials-form/index';
import { updateCredentials } from 'state/jetpack/credentials/actions';

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
				updateCredentials: this.props.updateCredentials,
				showCancelButton: true,
			} }
		/>
	</CompactCard>
);

export default connect( null, { updateCredentials } )( SetupForm );
