/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { pick } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from '../wrap-settings-form';

class DebugTab extends Component {
	static propTypes = {
		fields: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {},
	};

	deleteLog = () => this.props.saveSettings( this.props.siteId, { wpsc_delete_log: true } );

	disableLog = () => this.props.saveSettings( this.props.siteId, { wpsc_disable_log: true } );

	resetLog = () => this.props.saveSettings( this.props.siteId, { wpsc_reset_log: true } );

	render() {
		const {
			fields: {
				cache_path,
				wp_cache_debug_ip,
				wp_cache_debug_log = '',
				wp_super_cache_comments,
				wp_super_cache_debug,
				wp_cache_debug_username,
				wp_super_cache_front_page_check,
				wp_super_cache_front_page_clear,
				wp_super_cache_front_page_text,
				wp_super_cache_front_page_notification,
			},
			handleAutosavingToggle,
			handleChange,
			handleSubmitForm,
			isRequesting,
			isSaving,
			translate,
		} = this.props;

		const cacheFilename = wp_cache_debug_log.split( '/' ).pop();

		return (
			<div>
				{ !! wp_super_cache_debug &&
					<Card>
						<p>
							{ translate(
								'Fix problems with the plugin by debugging it here. ' +
								'It can log them to a file in your cache directory.'
							) }
						</p>
						<FormFieldset>
							<Button
								compact
								primary
								disabled={ isRequesting || isSaving }
								onClick={ this.resetLog }
								value="1">
								{ translate( 'Reset Debug Log' ) }
							</Button>
							<Button
								compact
								primary
								disabled={ isRequesting || isSaving }
								onClick={ this.disableLog }
								value="1">
								{ translate( 'Disable Debug Log' ) }
							</Button>
							<Button
								compact
								primary
								disabled={ isRequesting || isSaving }
								onClick={ this.deleteLog }
								value="1">
								{ translate( 'Disable and Delete Debug Log' ) }
							</Button>
						</FormFieldset>
						<p>
							{ translate(
								'Currently logging to: {{ExternalLink}}%(location)s{{/ExternalLink}}',
								{
									args: { location: cache_path + cacheFilename },
									components: {
										ExternalLink: <ExternalLink
											href={ wp_cache_debug_log }
											target="_blank" />
									}
								}
							) }
						</p>
						<p>
							{ translate(
								'Username and Password: %(username)s',
								{ args: { username: wp_cache_debug_username } }
							) }
						</p>
					</Card>
				}
				<form>
					<SectionHeader label={ translate( 'Debug' ) }>
						<FormButton
							compact
							primary
							disabled={ isRequesting || isSaving }
							isSubmitting={ isSaving }
							onClick={ handleSubmitForm } />
					</SectionHeader>
					<Card>
						<FormFieldset>
							<FormToggle
								checked={ !! wp_super_cache_debug }
								disabled={ isRequesting || isSaving }
								onChange={ handleAutosavingToggle( 'wp_super_cache_debug' ) }>
								{ translate( 'Enable Debugging' ) }
							</FormToggle>
						</FormFieldset>
						<div className="wp-super-cache__debug-fieldsets">
							<FormFieldset>
								<FormLabel htmlFor="ipAddress">
									{ translate( 'IP Address' ) }
								</FormLabel>
								<FormTextInput
									disabled={ isRequesting || isSaving || ! wp_super_cache_debug }
									id="ipAddress"
									onChange={ handleChange( 'wp_cache_debug_ip' ) }
									value={ wp_cache_debug_ip || '' } />
								<FormSettingExplanation>
									{ translate(
										'(only log requests from this IP address)',
									) }
								</FormSettingExplanation>
							</FormFieldset>
							<FormFieldset>
								<FormToggle
									checked={ !! wp_super_cache_comments }
									disabled={ isRequesting || isSaving || ! wp_super_cache_debug }
									onChange={ handleAutosavingToggle( 'wp_super_cache_comments' ) }>
									{ translate( 'Cache Status Messages' ) }
								</FormToggle>
								<FormSettingExplanation>
									{ translate(
											'Display comments at the end of every page like this:'
									) }
									<span className="wp-super-cache__debug-cache-comment-snippet">
										{ translate(
											'<!-- Dynamic page generated in 0.450 seconds. -->\n' +
											'<!-- Cached page generated by WP-Super-Cache on %(date)s -->\n' +
											'<!-- super cache -->',
											{
												args: { date: moment().utc().format( 'YYYY-MM-DD HH:mm:ss' ) }
											}
										) }
									</span>
								</FormSettingExplanation>
							</FormFieldset>
						</div>
					</Card>
				</form>

				<form>
					<SectionHeader label={ translate( 'Advanced' ) }>
						<FormButton
							compact
							primary
							disabled={ isRequesting || isSaving }
							isSubmitting={ isSaving }
							onClick={ handleSubmitForm } />
					</SectionHeader>
					<Card>
						<FormFieldset>
							<FormToggle
								checked={ !! wp_super_cache_front_page_check }
								disabled={ isRequesting || isSaving || ! wp_super_cache_debug }
								onChange={ handleAutosavingToggle( 'wp_super_cache_front_page_check' ) }>
								{ translate( 'Check front page every 5 minutes.' ) }
							</FormToggle>
							<FormSettingExplanation>
								{ translate( ' If there are errors you\'ll receive an email.' ) }
							</FormSettingExplanation>
						</FormFieldset>
						<div className="wp-super-cache__debug-fieldsets">
							<FormFieldset>
								<FormLabel htmlFor="frontPageText">
									{ translate( 'Check text for automatic cache clearing' ) }
								</FormLabel>
								<FormTextInput
									disabled={ isRequesting || isSaving || ! wp_super_cache_debug || ! wp_super_cache_front_page_check }
									id="frontPageText"
									onChange={ handleChange( 'wp_super_cache_front_page_text' ) }
									value={ wp_super_cache_front_page_text || '' } />
								<FormSettingExplanation>
									{ translate(
										'If the front page doesn\'t contain this text, the cache will be cleared automatically. ' +
										'Leave this field blank to disable automatic cache clearing.'
									) }
								</FormSettingExplanation>
							</FormFieldset>
							<FormFieldset>
								<FormToggle
									checked={ !! wp_super_cache_front_page_clear }
									disabled={ isRequesting || isSaving || ! wp_super_cache_debug || ! wp_super_cache_front_page_check }
									onChange={ handleAutosavingToggle( 'wp_super_cache_front_page_clear' ) }>
									{ translate( 'Clear cache on error.' ) }
								</FormToggle>
								<FormToggle
									checked={ !! wp_super_cache_front_page_notification }
									disabled={ isRequesting || isSaving || ! wp_super_cache_debug || ! wp_super_cache_front_page_check }
									onChange={ handleAutosavingToggle( 'wp_super_cache_front_page_notification' ) }>
									{ translate( 'Email the blog admin when checks are made. (useful for testing)' ) }
								</FormToggle>
							</FormFieldset>
						</div>
					</Card>
				</form>
			</div>
		);
	}
}

const getFormSettings = settings => {
	return pick( settings, [
		'cache_path',
		'wp_cache_debug_ip',
		'wp_cache_debug_log',
		'wp_super_cache_comments',
		'wp_super_cache_debug',
		'wp_cache_debug_username',
		'wp_super_cache_front_page_check',
		'wp_super_cache_front_page_clear',
		'wp_super_cache_front_page_text',
		'wp_super_cache_front_page_notification',
	] );
};

export default WrapSettingsForm( getFormSettings )( DebugTab );
