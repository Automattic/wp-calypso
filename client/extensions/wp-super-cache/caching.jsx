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
		super_cache_enabled,
		wp_cache_enabled,
	},
	handleRadio,
	handleToggle,
	isRequesting,
	translate,
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Caching' ) }>
				<Button
					compact
					primary
					disabled={ isRequesting }
					type="submit">
					{ translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>
			<Card>
				<form>
					<FormFieldset>
						<FormToggle
							checked={ !! wp_cache_enabled }
							disabled={ isRequesting }
							onChange={ handleToggle( 'wp_cache_enabled' ) }>
							<span>
								{ translate( 'Enable Page Caching' ) }
							</span>
						</FormToggle>
					</FormFieldset>

					<FormFieldset>
						<FormLabel>
							<FormRadio
								checked={ '1' === super_cache_enabled }
								disabled={ isRequesting }
								name="super_cache_enabled"
								onChange={ handleRadio }
								value="1" />
							<span>
								{ translate( 'Use mod_rewrite to serve cache files.' ) }
							</span>
						</FormLabel>

						<FormLabel>
							<FormRadio
								checked={ '2' === super_cache_enabled }
								disabled={ isRequesting }
								name="super_cache_enabled"
								onChange={ handleRadio }
								value="2" />
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
								checked={ '0' === super_cache_enabled }
								disabled={ isRequesting }
								name="super_cache_enabled"
								onChange={ handleRadio }
								value="0" />
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
		'super_cache_enabled',
		'wp_cache_enabled',
	] );
};

export default WrapSettingsForm( getFormSettings )( Caching );
