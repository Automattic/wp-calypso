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
import SectionHeader from 'components/section-header';
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle/compact';
import FormLegend from 'components/forms/form-legend';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import WrapSettingsForm from './wrap-settings-form';

/**
 * Render cache preload interval number input
 * @returns { object } React element containing the preload interval number input
 */
const renderCachePreloadInterval = ( {
	handleChange,
	preload_interval,
} ) => {
	return (
		<FormTextInput
			className="wp-super-cache__preload-interval"
			min="0"
			name="preload_interval"
			onChange={ handleChange( 'preload_interval' ) }
			step="1"
			type="number"
			value={ preload_interval || '' } />
	);
};

/**
 * The settings for the preload tab
 * @returns { object } React element containing the settings for the Preload tab
 */
const PreloadTab = ( {
	fields: {
		minimum_preload_interval,
		preload_email_volume,
		preload_interval,
		preload_on,
		preload_taxonomies,
	},
	handleChange,
	handleSelect,
	handleToggle,
	translate,
} ) => {
	const statusEmailAmountSelectValues = [
		{ value: 'none', description: translate( 'No emails' ) },
		{ value: 'many', description: translate( 'High (two emails per 100 posts)' ) },
		{ value: 'medium', description: translate( 'Medium (one email per 100 posts)' ) },
		{ value: 'less', description: translate( 'Low (one email at the start and one at the end of preloading all posts)' ) },
	];

	return (
		<div>
			<SectionHeader label={ ( 'Preload' ) }>
				<Button
					compact={ true }
					primary={ true }
					type="submit">
						{ translate( 'Save Settings' ) }
				</Button>
			</SectionHeader>

			<Card>
				<form>
					<FormFieldset>
						<div className="wp-super-cache__wp-cache-preload-on">
							<FormToggle
								checked={ !! preload_on }
								onChange={ handleToggle( 'preload_on' ) }>
								<span>
									{ translate(
										'Preload mode (garbage collection only on legacy cache files. {{em}}(Recommended){{/em}})',
										{
											components: { em: <em /> }
										} )
								}
								</span>
							</FormToggle>
						</div>

						<div className="wp-super-cache__wp-cache-preload-posts">
							<FormToggle
								checked={ preload_interval > 0 }>
								<span>
									{ translate(
										'Refresh preloaded cache files every {{number /}} minute. (minimum %s minutes.)',
										'Refresh preloaded cache files every {{number /}} minutes. (minimum %s minutes.)',
										{
											args: [
												minimum_preload_interval
											],
											count: preload_interval,
											components: {
												number: renderCachePreloadInterval( {
													preload_interval,
													minimum_preload_interval,
													handleChange
												} )
											}
										}
									)
								}</span>
							</FormToggle>
						</div>

						<div className="wp-super-cache__wp-cache-preload-taxonomies">
							<FormToggle
								checked={ !! preload_taxonomies }
								onChange={ handleToggle( 'preload_taxonomies' ) }>
								<span>
									{ translate( 'Preload tags, categories and other taxonomies.' ) }
								</span>
							</FormToggle>
						</div>
					</FormFieldset>

					<hr />

					<FormFieldset>
						<FormLegend>
							{ translate( 'Status Emails' ) }
						</FormLegend>
						<div className="wp-super-cache__wp-cache-preload-email-volume">
							<FormSelect
								id="preload_email_volume"
								name="preload_email_volume"
								onChange={ handleSelect }
								value={ preload_email_volume || 'none' }>
								{
									statusEmailAmountSelectValues.map( ( { value, description } ) => {
										return <option key={ value } value={ value }>{ description }</option>;
									} )
								}
							</FormSelect>
						</div>
						<FormSettingExplanation>
							{ translate( 'Send me status emails when files are refreshed during preload' ) }
						</FormSettingExplanation>
					</FormFieldset>
				</form>
			</Card>

			<SectionHeader label={ translate( 'Preload Cache' ) } />
			<Card>
				<Button
					type="submit">
						{ translate( 'Preload Cache Now' ) }
				</Button>
			</Card>
		</div>
	);
};

const preloadSettingsDefaults = {
	is_preload_enabled: true,
	minimum_preload_interval: 30,
	preload_email_me: false,
	preload_email_volume: 'none',
	preload_interval: 30,
	preload_on: false,
	preload_taxonomies: false,
};

const settingsKeys = Object.keys( preloadSettingsDefaults );

const getFormSettings = settings => {
	if ( ! settings ) {
		return preloadSettingsDefaults;
	}

	return Object.assign( {}, preloadSettingsDefaults, pick( settings, settingsKeys ) );
};

export default WrapSettingsForm( getFormSettings )( PreloadTab );
