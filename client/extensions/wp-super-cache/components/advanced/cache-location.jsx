/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';
import Card from 'client/components/card';
import FormFieldset from 'client/components/forms/form-fieldset';
import FormSettingExplanation from 'client/components/forms/form-setting-explanation';
import FormTextInput from 'client/components/forms/form-text-input';
import SectionHeader from 'client/components/section-header';
import WrapSettingsForm from '../wrap-settings-form';

const CacheLocation = ( {
	fields: { cache_path = '', default_cache_path = '' },
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
			<SectionHeader label={ translate( 'Cache Location' ) }>
				<Button compact primary disabled={ isDisabled } onClick={ handleSubmitForm }>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<form>
					<FormFieldset>
						<FormTextInput
							disabled={ isDisabled }
							onChange={ handleChange( 'cache_path' ) }
							value={ cache_path }
						/>
						<FormSettingExplanation>
							{ translate(
								'Change the location of your cache files. The default is WP_CONTENT_DIR . ' +
									'/cache/ which translates to {{cacheLocation/}}',
								{
									components: {
										cacheLocation: <span>{ default_cache_path }</span>,
									},
								}
							) }
						</FormSettingExplanation>
					</FormFieldset>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = settings => {
	return pick( settings, [ 'cache_path', 'default_cache_path' ] );
};

export default WrapSettingsForm( getFormSettings )( CacheLocation );
