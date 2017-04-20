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
import FormLegend from 'components/forms/form-legend';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormToggle from 'components/forms/form-toggle/compact';
import Notice from 'components/notice';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

/**
 * Render cache preload interval number input
 * @returns { object } React element containing the preload interval number input
 */
const renderCachePreloadInterval = ( {
	handleChange,
	isRequesting,
	preload_interval,
} ) => (
	<FormTextInput
		className="wp-super-cache__preload-interval"
		disabled={ isRequesting }
		min="0"
		name="preload_interval"
		onChange={ handleChange( 'preload_interval' ) }
		step="1"
		type="number"
		value={ preload_interval || '' } />
);

/**
 * The settings for the preload tab
 * @returns { object } React element containing the settings for the Preload tab
 */
const PreloadTab = ( {
	fields: {
		is_preload_enabled,
		is_preloading,
		minimum_preload_interval,
		preload_email_volume,
		preload_interval,
		preload_on,
		preload_posts,
		preload_posts_options,
		preload_refresh,
		preload_taxonomies,
		super_cache_enabled,
		wp_cache_enabled,
	},
	handleChange,
	handleSelect,
	handleToggle,
	isRequesting,
	translate,
} ) => {
	const statusEmailAmountSelectValues = [
		{ value: 'none', description: translate( 'No emails' ) },
		{ value: 'many', description: translate( 'High (two emails per 100 posts)' ) },
		{ value: 'medium', description: translate( 'Medium (one email per 100 posts)' ) },
		{ value: 'less', description: translate( 'Low (one email at the start and one at the end of preloading all posts)' ) },
	];

	if ( ! wp_cache_enabled ) {
		return (
			<Notice
				text={ translate( 'Caching must be enabled to use this feature.' ) }
				showDismiss={ false } />
		);
	}

	if ( ( '0' === super_cache_enabled ) || ! is_preload_enabled ) {
		return (
			<Notice
				text={ translate( 'Preloading of cache disabled. Please disable legacy page caching or talk to your host administrator.' ) }
				showDismiss={ false } />
		);
	}

	return (
		<div>
			<SectionHeader label={ ( 'Preload' ) }>
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
							checked={ !! preload_on }
							disabled={ isRequesting }
							onChange={ handleToggle( 'preload_on' ) }>
							<span>
								{ translate( 'Preload mode. (Garbage collection only on legacy cache files. Recommended.)' ) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ preload_refresh }
							disabled={ isRequesting }
							onChange={ handleToggle( 'preload_refresh' ) }>
							<span>
								{ translate(
									'Refresh preloaded cache files every {{number /}} minute. ',
									'Refresh preloaded cache files every {{number /}} minutes. ',
									{
										count: preload_interval,
										components: {
											number: renderCachePreloadInterval( {
												handleChange,
												isRequesting,
												preload_interval,
											} )
										}
									}
								) }

								{ translate(
									'(minimum %d minute)',
									'(minimum %d minutes)',
									{
										args: minimum_preload_interval,
										count: minimum_preload_interval,
									}
								) }
							</span>
						</FormToggle>

						<FormToggle
							checked={ !! preload_taxonomies }
							disabled={ isRequesting }
							onChange={ handleToggle( 'preload_taxonomies' ) }>
							<span>
								{ translate( 'Preload tags, categories and other taxonomies.' ) }
							</span>
						</FormToggle>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="preload_posts">
							{ translate( 'Preload Posts' ) }
						</FormLabel>
						<FormSelect
							className="wp-super-cache__preload-posts"
							disabled={ isRequesting }
							id="preload_posts"
							name="preload_posts"
							onChange={ handleSelect }
							value={ preload_posts || 'all' }>
							{ preload_posts_options.map( ( option ) => <option key={ option } value={ option }>{ option }</option> ) }
						</FormSelect>
					</FormFieldset>

					<hr />

					<FormFieldset>
						<FormLegend>
							{ translate( 'Status Emails' ) }
						</FormLegend>
						<FormSelect
							disabled={ isRequesting }
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
						<FormSettingExplanation>
							{ translate( 'Send me status emails when files are refreshed during preload.' ) }
						</FormSettingExplanation>
					</FormFieldset>
				</form>
			</Card>

			<SectionHeader label={ translate( 'Preload Cache' ) } />
			<Card>
			{ is_preloading
				? <Button compact>{ translate( 'Cancel Cache Preload' ) }</Button>
				: <Button compact>{ translate( 'Preload Cache Now' ) }</Button>
			}
			</Card>
		</div>
	);
};

const getFormSettings = settings => {
	return pick( settings, [
		'is_preload_enabled',
		'is_preloading',
		'minimum_preload_interval',
		'preload_email_volume',
		'preload_interval',
		'preload_on',
		'preload_posts',
		'preload_posts_options',
		'preload_refresh',
		'preload_taxonomies',
		'super_cache_enabled',
		'wp_cache_enabled',
	] );
};

export default WrapSettingsForm( getFormSettings )( PreloadTab );
