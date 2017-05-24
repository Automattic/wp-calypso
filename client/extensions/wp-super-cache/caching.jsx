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
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

const Caching = ( {
	fields: {
		cache_type,
		is_cache_enabled,
	},
	handleAutosavingToggle,
	handleRadio,
	handleSubmitForm,
	isRequesting,
	isSaving,
	translate,
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Caching' ) }>
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
						<FormToggle
							checked={ !! is_cache_enabled }
							disabled={ isRequesting || isSaving }
							onChange={ handleAutosavingToggle( 'is_cache_enabled' ) }>
							<span>
								{ translate( 'Enable Page Caching' ) }
							</span>
						</FormToggle>
					</FormFieldset>

					<FormFieldset className="wp-super-cache__cache-type-fieldset">
						<FormLabel>
							<FormRadio
								checked={ 'mod_rewrite' === cache_type }
								disabled={ isRequesting || isSaving || ! is_cache_enabled }
								name="cache_type"
								onChange={ handleRadio }
								value="mod_rewrite" />
							<span>
								{ translate( 'Use mod_rewrite to serve cache files.' ) }
							</span>
						</FormLabel>

						<FormLabel>
							<FormRadio
								checked={ 'PHP' === cache_type }
								disabled={ isRequesting || isSaving || ! is_cache_enabled }
								name="cache_type"
								onChange={ handleRadio }
								value="PHP" />
							<span>
								{ translate(
									'Use PHP to serve cache files. {{em}}(Recommended){{/em}}',
									{
										components: { em: <em /> }
									}
								) }
							</span>
						</FormLabel>

						<FormLabel>
							<FormRadio
								checked={ 'wpcache' === cache_type }
								disabled={ isRequesting || isSaving || ! is_cache_enabled }
								name="cache_type"
								onChange={ handleRadio }
								value="wpcache" />
							<span>
								{ translate( 'Legacy page caching.' ) }
							</span>
						</FormLabel>
						<FormSettingExplanation>
							{
								translate(
									'Mod_rewrite is fastest, PHP is almost as fast and easier to get working, ' +
									'while legacy caching is slower again, but more flexible and also easy to get ' +
									'working. New users should use PHP caching.'
								)
							}
						</FormSettingExplanation>
					</FormFieldset>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = settings => {
	return pick( settings, [
		'cache_type',
		'is_cache_enabled',
	] );
};

export default WrapSettingsForm( getFormSettings )( Caching );
