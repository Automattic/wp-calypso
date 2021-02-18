/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import SupportInfo from 'calypso/components/support-info';
import CommentDisplaySettings from './comment-display-settings';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormToggle from 'calypso/components/forms/form-toggle';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import Subscriptions from './subscriptions';
import wrapSettingsForm from './wrap-settings-form';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import JetpackModuleToggle from './jetpack-module-toggle';

class SiteSettingsFormDiscussion extends Component {
	handleCommentOrder = () => {
		this.props.trackEvent( 'Toggled Comment Order on Page' );
		this.props.updateFields(
			{
				comment_order: this.props.fields.comment_order === 'desc' ? 'asc' : 'desc',
			},
			() => {
				this.props.submitForm();
			}
		);
	};

	defaultArticleSettings() {
		const {
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			translate,
		} = this.props;
		return (
			<FormFieldset>
				<FormToggle
					checked={ !! fields.default_pingback_flag }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'default_pingback_flag' ) }
				>
					{ translate( 'Attempt to notify any blogs linked to from the article' ) }
				</FormToggle>
				<FormToggle
					checked={ !! fields.default_ping_status }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'default_ping_status' ) }
				>
					{ translate( 'Allow link notifications from other blogs (pingbacks and trackbacks)' ) }
				</FormToggle>
				<FormToggle
					checked={ !! fields.default_comment_status }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'default_comment_status' ) }
				>
					{ translate( 'Allow people to post comments on new articles' ) }
				</FormToggle>
				<FormSettingExplanation>
					{ translate( 'These settings may be overridden for individual articles.' ) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	commentDisplaySettings() {
		const { isJetpack } = this.props;
		if ( ! isJetpack ) {
			return null;
		}

		const { fields, isRequestingSettings, isSavingSettings, onChangeField } = this.props;

		const commentDisplaySettingsFields = {
			highlander_comment_form_prompt: fields.highlander_comment_form_prompt,
			jetpack_comment_form_color_scheme: fields.jetpack_comment_form_color_scheme,
		};

		return (
			<div>
				<QueryJetpackModules siteId={ this.props.siteId } />
				<CommentDisplaySettings
					onChangeField={ onChangeField }
					submittingForm={ isRequestingSettings || isSavingSettings }
					fields={ commentDisplaySettingsFields }
				/>
				<hr />
			</div>
		);
	}

	otherCommentSettings() {
		const {
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			siteId,
			translate,
		} = this.props;
		return (
			<FormFieldset className="site-settings__other-comment-settings">
				<FormToggle
					checked={ !! fields.require_name_email }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'require_name_email' ) }
				>
					{ translate( 'Comment author must fill out name and e-mail' ) }
				</FormToggle>
				<FormToggle
					checked={ !! fields.comment_registration }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'comment_registration' ) }
				>
					{ translate( 'Users must be registered and logged in to comment' ) }
				</FormToggle>
				<FormToggle
					checked={ !! fields.close_comments_for_old_posts }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'close_comments_for_old_posts' ) }
				>
					{ translate(
						'Automatically close comments on articles older than {{numberOfDays /}} day',
						'Automatically close comments on articles older than {{numberOfDays /}} days',
						{
							count: fields.close_comments_days_old || 2,
							components: {
								numberOfDays: this.renderInputNumberDays(),
							},
						}
					) }
				</FormToggle>
				<FormToggle
					checked={ !! fields.thread_comments }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'thread_comments' ) }
				>
					{ translate( 'Enable threaded (nested) comments up to {{number /}} levels deep', {
						components: {
							number: this.renderInputThreadDepth(),
						},
					} ) }
				</FormToggle>
				<FormToggle
					checked={ !! fields.page_comments }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'page_comments' ) }
				>
					{ translate(
						'Break comments into pages with {{numComments /}} top level comments per page and the ' +
							'{{firstOrLast /}} page displayed by default',
						{
							components: {
								numComments: this.renderInputNumComments(),
								firstOrLast: this.renderInputDisplayDefault(),
							},
						}
					) }
				</FormToggle>
				<FormToggle
					checked={ 'asc' === fields.comment_order }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ this.handleCommentOrder }
				>
					{ translate(
						'Comments should be displayed with the older comments at the top of each page'
					) }
				</FormToggle>

				{ this.props.isJetpack && (
					<SupportInfo
						text={ translate( 'Hovercards appear when you place your mouse over any Gravatar.' ) }
						link="https://jetpack.com/support/gravatar-hovercards/"
					/>
				) }
				<JetpackModuleToggle
					disabled={ isRequestingSettings || isSavingSettings }
					label={ translate( 'Enable pop-up business cards over commenters’ Gravatars' ) }
					moduleSlug="gravatar-hovercards"
					siteId={ siteId }
				/>

				{ this.props.isJetpack && (
					<SupportInfo
						text={ translate(
							'Comment Likes are a fun, easy way to demonstrate your appreciation or agreement.'
						) }
						link="https://jetpack.com/support/comment-likes/"
					/>
				) }
				<JetpackModuleToggle
					disabled={ isRequestingSettings || isSavingSettings }
					label={ translate( 'Enable comment likes' ) }
					moduleSlug="comment-likes"
					siteId={ siteId }
				/>
			</FormFieldset>
		);
	}

	renderInputNumberDays() {
		const {
			eventTracker,
			fields,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			uniqueEventTracker,
		} = this.props;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<FormTextInput
				name="close_comments_days_old"
				type="number"
				min="0"
				step="1"
				id="close_comments_days_old"
				className="small-text"
				value={
					'undefined' === typeof fields.close_comments_days_old
						? 14
						: fields.close_comments_days_old
				}
				onChange={ onChangeField( 'close_comments_days_old' ) }
				disabled={ isRequestingSettings || isSavingSettings }
				onClick={ eventTracker( 'Clicked Automatically Close Days Field' ) }
				onKeyPress={ uniqueEventTracker( 'Typed in Automatically Close Days Field' ) }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderInputThreadDepth() {
		const {
			eventTracker,
			fields,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
		} = this.props;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<FormSelect
				className="is-compact"
				name="thread_comments_depth"
				value={ fields.thread_comments_depth }
				onChange={ onChangeField( 'thread_comments_depth' ) }
				disabled={ isRequestingSettings || isSavingSettings }
				onClick={ eventTracker( 'Selected Comment Nesting Level' ) }
			>
				{ [ 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map( ( level ) => (
					<option value={ level } key={ 'comment-depth-' + level }>
						{ level }
					</option>
				) ) }
			</FormSelect>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderInputNumComments() {
		const {
			eventTracker,
			fields,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			uniqueEventTracker,
		} = this.props;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<FormTextInput
				name="comments_per_page"
				type="number"
				step="1"
				min="0"
				id="comments_per_page"
				value={ 'undefined' === typeof fields.comments_per_page ? 50 : fields.comments_per_page }
				onChange={ onChangeField( 'comments_per_page' ) }
				className="small-text"
				disabled={ isRequestingSettings || isSavingSettings }
				onClick={ eventTracker( 'Clicked Comments Per Page Field' ) }
				onKeyPress={ uniqueEventTracker( 'Typed in Comments Per Page Field' ) }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderInputDisplayDefault() {
		const {
			eventTracker,
			fields,
			isRequestingSettings,
			onChangeField,
			translate,
			isSavingSettings,
		} = this.props;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<FormSelect
				className="is-compact"
				name="default_comments_page"
				style={ { marginTop: '4px' } }
				value={ fields.default_comments_page }
				onChange={ onChangeField( 'default_comments_page' ) }
				disabled={ isRequestingSettings || isSavingSettings }
				onClick={ eventTracker( 'Selected Comment Page Display Default' ) }
			>
				<option value="newest">{ translate( 'last' ) }</option>
				<option value="oldest">{ translate( 'first' ) }</option>
			</FormSelect>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	emailMeSettings() {
		const {
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			translate,
		} = this.props;
		return (
			<FormFieldset>
				<FormLegend>{ translate( 'E-mail me whenever' ) }</FormLegend>
				<FormToggle
					checked={ !! fields.comments_notify }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'comments_notify' ) }
				>
					{ translate( 'Anyone posts a comment' ) }
				</FormToggle>
				<FormToggle
					checked={ !! fields.moderation_notify }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'moderation_notify' ) }
				>
					{ translate( 'A comment is held for moderation' ) }
				</FormToggle>
				{ this.emailMeLikes() }
				{ this.emailMeReblogs() }
				{ this.emailMeFollows() }
			</FormFieldset>
		);
	}

	emailMeLikes() {
		const {
			fields,
			handleAutosavingToggle,
			isJetpack,
			isLikesModuleActive,
			isRequestingSettings,
			isSavingSettings,
			translate,
		} = this.props;
		// likes are only supported on jetpack sites with the Likes module activated
		if ( isJetpack && ! isLikesModuleActive ) {
			return null;
		}

		return (
			<FormToggle
				checked={ !! fields.social_notifications_like }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleAutosavingToggle( 'social_notifications_like' ) }
			>
				{ translate( 'Someone likes one of my posts' ) }
			</FormToggle>
		);
	}

	emailMeReblogs() {
		const {
			fields,
			handleAutosavingToggle,
			isJetpack,
			isRequestingSettings,
			isSavingSettings,
			translate,
		} = this.props;
		// reblogs are not supported on Jetpack sites
		if ( isJetpack ) {
			return null;
		}

		return (
			<FormToggle
				checked={ !! fields.social_notifications_reblog }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleAutosavingToggle( 'social_notifications_reblog' ) }
			>
				{ translate( 'Someone reblogs one of my posts' ) }
			</FormToggle>
		);
	}

	emailMeFollows() {
		const {
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			translate,
		} = this.props;

		return (
			<FormToggle
				checked={ !! fields.social_notifications_subscribe }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleAutosavingToggle( 'social_notifications_subscribe' ) }
			>
				{ translate( 'Someone follows my blog' ) }
			</FormToggle>
		);
	}

	beforeCommentSettings() {
		const {
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			translate,
		} = this.props;
		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Before a comment appears' ) }</FormLegend>
				<FormToggle
					checked={ !! fields.comment_moderation }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'comment_moderation' ) }
				>
					{ translate( 'Comment must be manually approved' ) }
				</FormToggle>
				<FormToggle
					checked={ !! fields.comment_previously_approved }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'comment_previously_approved' ) }
				>
					{ translate( 'Comment author must have a previously approved comment' ) }
				</FormToggle>
			</FormFieldset>
		);
	}

	commentModerationSettings() {
		const {
			eventTracker,
			fields,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			siteSlug,
			translate,
			uniqueEventTracker,
		} = this.props;
		return (
			<FormFieldset className="site-settings__moderation-settings">
				<FormLegend>{ translate( 'Comment moderation' ) }</FormLegend>
				<p>
					{ translate(
						'Hold a comment in the queue if it contains {{numberOfLinks /}} or more links. ' +
							'(A common characteristic of comment spam is a large number of hyperlinks.)',
						{
							components: {
								numberOfLinks: this.renderInputNumLinks(),
							},
						}
					) }
				</p>
				<FormLabel htmlFor="moderation_keys">
					{ translate(
						'When a comment contains any of these words in its content, name, URL, e-mail, or IP, it will be ' +
							'held in the {{link}}moderation queue{{/link}}. One word or IP per line. It will match inside words, so "press" ' +
							'will match "WordPress".',
						{
							components: {
								link: <a href={ `/comments/pending/${ siteSlug }` } />,
							},
						}
					) }
				</FormLabel>
				<FormTextarea
					name="moderation_keys"
					id="moderation_keys"
					value={ fields.moderation_keys }
					onChange={ onChangeField( 'moderation_keys' ) }
					disabled={ isRequestingSettings || isSavingSettings }
					autoCapitalize="none"
					onClick={ eventTracker( 'Clicked Moderation Queue Field' ) }
					onKeyPress={ uniqueEventTracker( 'Typed in Moderation Queue Field' ) }
				/>
			</FormFieldset>
		);
	}

	disallowedCommentsSettings() {
		const {
			eventTracker,
			fields,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			translate,
			uniqueEventTracker,
		} = this.props;
		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Disallowed comments' ) }</FormLegend>
				<FormLabel htmlFor="disallowed_comment_keys">
					{ translate(
						'When a comment contains any of these words in its content, name, URL, e-mail, or IP, it will be put in the trash. ' +
							'One word or IP per line. It will match inside words, so "press" will match "WordPress".'
					) }
				</FormLabel>
				<FormTextarea
					name="disallowed_comment_keys"
					id="disallowed_comment_keys"
					value={ fields.disallowed_keys }
					onChange={ onChangeField( 'disallowed_keys' ) }
					disabled={ isRequestingSettings || isSavingSettings }
					autoCapitalize="none"
					onClick={ eventTracker( 'Clicked Disallowed Comments Field' ) }
					onKeyPress={ uniqueEventTracker( 'Typed in Disallowed Comments Field' ) }
				/>
			</FormFieldset>
		);
	}

	renderInputNumLinks() {
		const {
			eventTracker,
			fields,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			uniqueEventTracker,
		} = this.props;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<FormTextInput
				name="comment_max_links"
				type="number"
				step="1"
				min="0"
				className="small-text"
				value={ 'undefined' === typeof fields.comment_max_links ? 2 : fields.comment_max_links }
				onChange={ onChangeField( 'comment_max_links' ) }
				disabled={ isRequestingSettings || isSavingSettings }
				onClick={ eventTracker( 'Clicked Comment Queue Link Count Field' ) }
				onKeyPress={ uniqueEventTracker( 'Typed in Comment Queue Link Count Field' ) }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	render() {
		const {
			fields,
			handleSubmitForm,
			handleAutosavingToggle,
			siteId,
			isRequestingSettings,
			isSavingSettings,
			isJetpack,
			translate,
		} = this.props;
		return (
			<form id="site-settings" onSubmit={ handleSubmitForm }>
				<SettingsSectionHeader title={ translate( 'Default article settings' ) } />
				<Card className="site-settings__discussion-settings">
					{ this.defaultArticleSettings() }
				</Card>

				<SettingsSectionHeader
					disabled={ isRequestingSettings || isSavingSettings }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Comments' ) }
				/>
				<Card className="site-settings__discussion-settings">
					{ this.commentDisplaySettings() }
					{ this.otherCommentSettings() }
					<hr />
					{ this.emailMeSettings() }
					<hr />
					{ this.beforeCommentSettings() }
					<hr />
					{ this.commentModerationSettings() }
					<hr />
					{ this.disallowedCommentsSettings() }
				</Card>

				{ isJetpack && (
					<div>
						<QueryJetpackModules siteId={ siteId } />

						<SettingsSectionHeader title={ translate( 'Subscriptions' ) } />

						<Subscriptions
							onSubmitForm={ handleSubmitForm }
							handleAutosavingToggle={ handleAutosavingToggle }
							isSavingSettings={ isSavingSettings }
							isRequestingSettings={ isRequestingSettings }
							fields={ fields }
						/>
					</div>
				) }
			</form>
		);
	}
}

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	const isJetpack = isJetpackSite( state, siteId );
	const isLikesModuleActive = isJetpackModuleActive( state, siteId, 'likes' );

	return {
		siteId,
		siteSlug,
		isJetpack,
		isLikesModuleActive,
	};
} );

const getFormSettings = ( settings ) => {
	return pick( settings, [
		'default_pingback_flag',
		'default_ping_status',
		'default_comment_status',
		'require_name_email',
		'comments',
		'comment_registration',
		'close_comments_for_old_posts',
		'close_comments_days_old',
		'thread_comments',
		'thread_comments_depth',
		'page_comments',
		'comments_per_page',
		'default_comments_page',
		'comment_order',
		'comments_notify',
		'moderation_notify',
		'likes',
		'social_notifications_like',
		'social_notifications_reblog',
		'social_notifications_subscribe',
		'comment_moderation',
		'comment_previously_approved',
		'comment_max_links',
		'moderation_keys',
		'disallowed_keys',
		'highlander_comment_form_prompt',
		'jetpack_comment_form_color_scheme',
		'subscriptions',
		'stb_enabled',
		'stc_enabled',
	] );
};

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormDiscussion );
