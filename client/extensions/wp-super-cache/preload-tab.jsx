/**
 * External dependencies
 */
import React, { Component } from 'react';
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
	isSaving,
	preload_interval,
} ) => (
	<FormTextInput
		className="wp-super-cache__preload-interval"
		disabled={ isRequesting || isSaving }
		min="0"
		name="preload_interval"
		onChange={ handleChange( 'preload_interval' ) }
		step="1"
		type="number"
		value={ preload_interval || '' } />
);

class PreloadTab extends Component {
	state = {
		preloadRefresh: true,
	}

	handlePreloadRefreshChange = () => {
		this.setState( { preloadRefresh: ! this.state.preloadRefresh } );
	}

	getPreloadPostsOptions( post_count ) {
		if ( ! post_count || ( post_count <= 100 ) ) {
			return [];
		}

		const step = Math.floor( post_count / 10 );
		const options = [ 'all' ];

		for ( let i = step; i < post_count; i += step ) {
			options.push( i );
		}

		options.push( post_count );

		return options;
	}

	render() {
		const {
			fields,
			handleAutosavingToggle,
			handleChange,
			handleSelect,
			handleSubmitForm,
			isRequesting,
			isSaving,
			translate,
		} = this.props;

		const {
			is_cache_enabled,
			is_preload_enabled,
			is_preloading,
			is_super_cache_enabled,
			minimum_preload_interval,
			post_count,
			preload_email_volume,
			preload_interval,
			preload_on,
			preload_posts,
			preload_taxonomies,
		} = fields;

		const statusEmailAmountSelectValues = [
			{ value: 'none', description: translate( 'No emails' ) },
			{ value: 'many', description: translate( 'High (two emails per 100 posts)' ) },
			{ value: 'medium', description: translate( 'Medium (one email per 100 posts)' ) },
			{ value: 'less', description: translate( 'Low (one email at the start and one at the end of preloading all posts)' ) },
		];

		if ( ! is_cache_enabled ) {
			return (
				<Notice
					text={ translate( 'Caching must be enabled to use this feature.' ) }
					showDismiss={ false } />
			);
		}

		if ( is_super_cache_enabled && ! is_preload_enabled ) {
			return (
				<Notice
					text={ translate( 'Preloading of cache disabled. Please disable legacy page caching or talk to ' +
						'your host administrator.' ) }
					showDismiss={ false } />
			);
		}

		return (
			<div>
				<SectionHeader label={ ( 'Preload' ) }>
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
								checked={ !! preload_on }
								disabled={ isRequesting || isSaving }
								onChange={ handleAutosavingToggle( 'preload_on' ) }>
								<span>
									{ translate( 'Preload mode. (Garbage collection only on legacy cache files. Recommended.)' ) }
								</span>
							</FormToggle>

							<FormToggle
								checked={ this.state.preloadRefresh }
								disabled={ isRequesting || isSaving }
								onChange={ this.handlePreloadRefreshChange }>
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
													isSaving,
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
								disabled={ isRequesting || isSaving }
								onChange={ handleAutosavingToggle( 'preload_taxonomies' ) }>
								<span>
									{ translate( 'Preload tags, categories and other taxonomies.' ) }
								</span>
							</FormToggle>
						</FormFieldset>

						{ post_count && post_count > 100 &&
						<FormFieldset>
							<FormLabel htmlFor="preload_posts">
								{ translate( 'Preload Posts' ) }
							</FormLabel>
							<FormSelect
								className="wp-super-cache__preload-posts"
								disabled={ isRequesting || isSaving }
								id="preload_posts"
								name="preload_posts"
								onChange={ handleSelect }
								value={ preload_posts || 'all' }>
								{
									this.getPreloadPostsOptions( post_count )
										.map( option => <option key={ option } value={ option }>{ option }</option> )
								}
							</FormSelect>
						</FormFieldset>
						}

						<hr />

						<FormFieldset>
							<FormLegend>
								{ translate( 'Status Emails' ) }
							</FormLegend>
							<FormSelect
								disabled={ isRequesting || isSaving }
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
	}
}

const getFormSettings = settings => {
	return pick( settings, [
		'is_cache_enabled',
		'is_preload_enabled',
		'is_preloading',
		'is_super_cache_enabled',
		'minimum_preload_interval',
		'post_count',
		'preload_email_volume',
		'preload_interval',
		'preload_on',
		'preload_posts',
		'preload_taxonomies',
	] );
};

export default WrapSettingsForm( getFormSettings )( PreloadTab );
