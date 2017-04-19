/**
 * External dependencies
 */
import React from 'react';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

const CacheLocation = ( {
	fields: {
		cache_path,
	},
	handleChange,
	handleSubmitForm,
	isRequesting,
	isSaving,
	translate,
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Cache Location' ) }>
				<Button
					compact
					primary
					disabled={ isRequesting || isSaving }
					onClick={ handleSubmitForm }>
					{ isSaving
						? translate( 'Saving…' )
						: translate( 'Save Settings' )
					}
				</Button>
			</SectionHeader>
			<Card>
				<form>
					<FormFieldset>
						<FormTextInput
							disabled={ isRequesting || isSaving }
							onChange={ handleChange( 'cache_path' ) }
							value={ cache_path || '' } />
						<FormSettingExplanation>
							{ translate(
								'Change the location of your cache files. The default is WP_CONTENT_DIR . ' +
								'/cache/ which translates to {{cacheLocation/}}',
								{
									components: {
										cacheLocation: <span>{ cache_path || '' }</span>,
									}
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
	return pick( settings, [
		'cache_path',
	] );
};

export default WrapSettingsForm( getFormSettings )( CacheLocation );
