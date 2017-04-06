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
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import WrapSettingsForm from './wrap-settings-form';

/**
 * Preload Tab
 * @returns {Jsx} the template
 */
const PreloadTab = ( {
	fields: {
		minimum_preload_interval,
		wp_cache_preload_interval,
		wp_cache_preload_posts,
		wp_cache_preload_on,
		wp_cache_preload_taxonomies,
		wp_cache_preload_email_volume,
	},
	translate,
	handleToggle,
	handleChange,
	handleSelect,
} ) => {
	const preloadPostsSelectValues = [ 17, 34, 51, 68, 85, 102, 119 ];
	const statusEmailAmountSelectValues = [
		{ value: 'none', description: translate( 'No emails' ) },
		{ value: 'many', description: translate( 'Many emails, 2 emails per 100 posts.' ) },
		{ value: 'medium', description: translate( 'Medium, 1 email per 100 posts.' ) },
		{ value: 'less', description: translate( 'Less emails, 1 at the start and 1 at the end of preloading all posts.' ) }
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
						<div className="wp-super-cache__wp-cache-preload-posts">
							<FormLabel htmlFor="wp_cache_preload_interval">
								{ translate( 'Refresh preloaded cache interval' ) }
							</FormLabel>

							<FormTextInput
								className="wp-super-cache__wp-cache-preload-interval"
								onChange={ handleChange( 'wp_cache_preload_interval' ) }
								value={ wp_cache_preload_interval || '' } />
							{ translate( 'minutes' ) }
							<FormSettingExplanation>
								{
									translate(
										'Refresh preloaded cache files every %(value) minutes. (0 to disable, minimum %(minimum) minutes.)',
										{
											args: {
												value: wp_cache_preload_interval,
												minimum: minimum_preload_interval
											}
										}
									)
								}
							</FormSettingExplanation>
						</div>

						<div className="wp-super-cache__wp-cache-preload-posts">
							<FormLabel htmlFor="wp_cache_preload_posts">
								{ translate( 'Preload Posts' ) }
							</FormLabel>

							<FormSelect
								id="wp_cache_preload_posts"
								name="wp_cache_preload_posts"
								onChange={ handleSelect }
								value={ wp_cache_preload_posts || 'all' }>
								<option key="all" value="all">{translate( 'all' )}</option>
								{
									preloadPostsSelectValues.map( value => {
										return <option key={ value } value={ value }>{ value }</option>;
									} )
								}
							</FormSelect>
							<FormSettingExplanation>
								{ translate( 'How many Posts to preload' ) }
							</FormSettingExplanation>
						</div>

						<div className="wp-super-cache__wp-cache-preload-on">
							<FormToggle
								checked={ !! wp_cache_preload_on }
								onChange={ handleToggle( 'wp_cache_preload_on' ) }>
								<span>
								{
									translate( 'Preload mode (garbage collection only on legacy cache files. {{em}}(Recommended){{/em}})',
										{
											components: { em: <em /> }
										} )
								}
								</span>
							</FormToggle>
						</div>

						<div className="wp-super-cache__wp-cache-preload-taxonomies">
							<FormToggle
								checked={ !! wp_cache_preload_taxonomies }
								onChange={ handleToggle( 'wp_cache_preload_taxonomies' ) }>
								<span>{ translate( 'Preload tags, categories and other taxonomies.' ) }</span>
							</FormToggle>
						</div>

						<div className="wp-super-cache__wp-cache-preload-email-volume">
							<FormLabel htmlFor="wp_cache_preload_email_volume">
								{ translate( 'Preload Email Volume' ) }
							</FormLabel>

							<FormSelect
								id="wp_cache_preload_email_volume"
								name="wp_cache_preload_email_volume"
								onChange={ handleSelect }
								value={ wp_cache_preload_email_volume || 'none' }>
								{
									statusEmailAmountSelectValues.map( ( { value, description } ) => {
										return <option key={ value } value={ value }>{ description }</option>;
									} )
								}
							</FormSelect>
						</div>
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
	wp_cache_preload_interval: 30,
	minimum_preload_interval: 30,
	wp_cache_preload_posts: 'all',
	wp_cache_preload_on: false,
	wp_cache_preload_taxonomies: false,
	wp_cache_preload_email_me: false,
	wp_cache_preload_email_volume: 'none',
};

const settingsKeys = Object.keys( preloadSettingsDefaults );

const getFormSettings = settings => {
	if ( ! settings ) {
		return preloadSettingsDefaults;
	}

	return Object.assign( {}, preloadSettingsDefaults, pick( settings, settingsKeys ) );
};

export default WrapSettingsForm( getFormSettings )( PreloadTab );
