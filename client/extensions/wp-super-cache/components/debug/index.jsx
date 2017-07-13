/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { flowRight, get, map, pick } from 'lodash';
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
import QueryDebugLogs from '../data/query-debug-logs';
import WrapSettingsForm from '../wrap-settings-form';
import { getSelectedSiteId } from 'state/ui/selectors';
import { deleteDebugLog } from '../../state/debug/actions';
import { getDebugLogs, isDeletingDebugLog } from '../../state/debug/selectors';

class DebugTab extends Component {
	static propTypes = {
		fields: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {},
	};

	deleteLog = ( event ) => {
		const log = get( event, 'currentTarget.dataset.log', '' );
		this.props.deleteDebugLog( this.props.siteId, log );
	}

	render() {
		const {
			debugLogs,
			fields: {
				wp_cache_debug_ip,
				wp_super_cache_comments,
				wp_super_cache_debug,
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
			siteId,
			translate,
		} = this.props;

		return (
			<div>
				<QueryDebugLogs siteId={ siteId } />
				<form>
					<SectionHeader label={ translate( 'Debug' ) } />
					<Card>
						<FormToggle
							checked={ !! wp_super_cache_debug }
							disabled={ isRequesting || isSaving }
							onChange={ handleAutosavingToggle( 'wp_super_cache_debug' ) }>
							{ translate( 'Enable Debugging' ) }
						</FormToggle>
					</Card>

					{ !! wp_super_cache_debug &&
						<div>
							<SectionHeader label={ translate( 'Debug Logs' ) } />
							<Card>
								<table>
									<thead>
										<tr>
											<th>{ translate( 'Filename' ) }</th>
											<th>{ translate( 'Username/Password' ) }</th>
											<th>{ translate( 'Delete' ) }</th>
										</tr>
									</thead>
									<tbody>
									{ debugLogs.map( ( { filename, username, isDeleting } ) => (
										<tr key={ filename }>
											<td>
												<ExternalLink href={ filename } target="_blank">
													{ filename }
												</ExternalLink>
											</td>
											<td>{ username }</td>
											<td>
												<Button
													busy={ isDeleting }
													className="wp-super-cache__debug-log-delete"
													compact
													data-log={ filename }
													disabled={ isDeleting }
													onClick={ this.deleteLog }>
													{ translate( 'Delete' ) }
												</Button>
											</td>
										</tr>
									) ) }
									</tbody>
								</table>
							</Card>
						</div>
					}

					<SectionHeader label={ translate( 'Settings' ) }>
						<FormButton
							compact
							primary
							disabled={ isRequesting || isSaving }
							isSubmitting={ isSaving }
							onClick={ handleSubmitForm } />
					</SectionHeader>
					<Card>
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
		'wp_cache_debug_ip',
		'wp_super_cache_comments',
		'wp_super_cache_debug',
		'wp_super_cache_front_page_check',
		'wp_super_cache_front_page_clear',
		'wp_super_cache_front_page_text',
		'wp_super_cache_front_page_notification',
	] );
};

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		const debugLogs = map(
			getDebugLogs( state, siteId ),
			( username, filename ) => ( {
				filename,
				isDeleting: isDeletingDebugLog( state, siteId, filename ),
				username,
			} )
		);

		return {
			debugLogs
		};
	},
	{ deleteDebugLog },
);

export default flowRight(
	connectComponent,
	WrapSettingsForm( getFormSettings )
)( DebugTab );
