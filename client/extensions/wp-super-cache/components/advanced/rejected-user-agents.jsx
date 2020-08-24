/**
 * External dependencies
 */

import React from 'react';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextarea from 'components/forms/form-textarea';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from '../wrap-settings-form';

const RejectedUserAgents = ( {
	fields: { cache_rejected_user_agent },
	handleChange,
	handleSubmitForm,
	isReadOnly,
	isRequesting,
	isSaving,
	translate,
} ) => {
	const isDisabled = isRequesting || isSaving || isReadOnly;

	return (
		<div>
			<SectionHeader label={ translate( 'Rejected User Agents' ) }>
				<Button compact primary disabled={ isDisabled } onClick={ handleSubmitForm }>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<form>
					<FormFieldset>
						<FormTextarea
							disabled={ isDisabled }
							onChange={ handleChange( 'cache_rejected_user_agent' ) }
							value={ cache_rejected_user_agent }
						/>
						<FormSettingExplanation>
							{ translate(
								'Strings in the HTTP ’User Agent’ header that prevent WP-Cache from caching bot, ' +
									'spiders, and crawlers’ requests. Note that super cached files are still sent to ' +
									'these agents if they already exists.'
							) }
						</FormSettingExplanation>
					</FormFieldset>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = ( settings ) => {
	return pick( settings, [ 'cache_rejected_user_agent' ] );
};

export default WrapSettingsForm( getFormSettings )( RejectedUserAgents );
