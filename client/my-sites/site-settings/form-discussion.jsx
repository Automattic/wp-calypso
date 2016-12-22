/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import FormToggle from 'components/forms/form-toggle';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Card from 'components/card';
import Button from 'components/button';
import SectionHeader from 'components/section-header';
import { isJetpackSite, isJetpackModuleActive } from 'state/sites/selectors';

class SiteSettingsFormDiscussion extends Component {
	handleCommentOrder = () => {
		this.props.trackToggle( 'Comment Order on Page' );
		this.props.updateFields( {
			comment_order: this.props.fields.comment_order === 'desc' ? 'asc' : 'desc'
		} );
	};

	onTrackSelectAndStop = recordObject => clickEvent => {
		this.trackSelect( recordObject );
		clickEvent.preventDefault();
	};

	defaultArticleSettings() {
		const { fields, handleToggle, isRequestingSettings, translate } = this.props;
		return (
			<FormFieldset>
				<FormToggle
					className="is-compact"
					checked={ !! fields.default_pingback_flag }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'default_pingback_flag' ) }>
					<span>{ translate( 'Attempt to notify any blogs linked to from the article' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! fields.default_ping_status }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'default_ping_status' ) }>
					<span>{ translate( 'Allow link notifications from other blogs (pingbacks and trackbacks)' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! fields.default_comment_status }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'default_comment_status' ) }>
					<span>{ translate( 'Allow people to post comments on new articles' ) }</span>
				</FormToggle>
				<FormSettingExplanation>
					{ translate( '(These settings may be overridden for individual articles.)' ) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}

	otherCommentSettings() {
		const { fields, handleToggle, isRequestingSettings, translate } = this.props;
		const markdownSupported = fields.markdown_supported;
		return (
			<FormFieldset className="site-settings__other-comment-settings">
				<FormToggle
					className="is-compact"
					checked={ !! fields.require_name_email }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'require_name_email' ) }>
					<span>{ translate( 'Comment author must fill out name and e-mail' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! fields.comment_registration }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'comment_registration' ) }>
					<span>{ translate( 'Users must be registered and logged in to comment' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! fields.close_comments_for_old_posts }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'close_comments_for_old_posts' ) }>
					<span>
						{
							translate(
								'Automatically close comments on articles older than {{numberOfDays /}} day',
								'Automatically close comments on articles older than {{numberOfDays /}} days', {
									count: fields.close_comments_days_old || 2,
									components: {
										numberOfDays: this.renderInputNumberDays()
									}
								}
							)
						}
					</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! fields.thread_comments }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'thread_comments' ) }>
					<span>
						{
							translate( 'Enable threaded (nested) comments up to {{number /}} levels deep', {
								components: {
									number: this.renderInputThreadDepth()
								}
							} )
						}
					</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! fields.page_comments }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'page_comments' ) }>
					<span>
						{
							translate(
								'Break comments into pages with {{numComments /}} top level comments per page and the ' +
								'{{firstOrLast /}} page displayed by default',
								{
									components: {
										numComments: this.renderInputNumComments(),
										firstOrLast: this.renderInputDisplayDefault()
									}
								}
							)
						}
					</span>
				</FormToggle>
				{ markdownSupported &&
					<FormToggle
						className="is-compact"
						checked={ !! fields.wpcom_publish_comments_with_markdown }
						disabled={ isRequestingSettings }
						onChange={ handleToggle( 'wpcom_publish_comments_with_markdown' ) }>
						<span>
							{
								translate( 'Enable Markdown for comments. {{a}}Learn more about markdown{{/a}}.', {
									components: {
										a: <a
											href="http://en.support.wordpress.com/markdown-quick-reference/"
											target="_blank"
											rel="noopener noreferrer" />
									}
								} )
							}
						</span>
					</FormToggle>
				}
				<FormToggle
					className="is-compact"
					checked={ 'asc' === fields.comment_order }
					disabled={ isRequestingSettings }
					onChange={ this.handleCommentOrder }>
					<span>{ translate( 'Comments should be displayed with the older comments at the top of each page' ) }</span>
				</FormToggle>
			</FormFieldset>
		);
	}

	renderInputNumberDays() {
		const { clickTracker, fields, isRequestingSettings, onChangeField, typeTracker } = this.props;
		return (
			<FormTextInput
				name="close_comments_days_old"
				type="number"
				min="0"
				step="1"
				id="close_comments_days_old"
				className="small-text"
				value={ 'undefined' === typeof fields.close_comments_days_old ? 14 : fields.close_comments_days_old }
				onChange={ onChangeField( 'close_comments_days_old' ) }
				disabled={ isRequestingSettings }
				onClick={ clickTracker( 'Automatically Close Days Field' ) }
				onKeyPress={ typeTracker( 'Automatically Close Days Field' ) }
			/>
		);
	}

	renderInputThreadDepth() {
		const { fields, isRequestingSettings, onChangeField } = this.props;
		return (
			<FormSelect
				className="is-compact"
				name="thread_comments_depth"
				value={ fields.thread_comments_depth }
				onChange={ onChangeField( 'thread_comments_depth' ) }
				disabled={ isRequestingSettings }
				onClick={ this.onTrackSelectAndStop( 'Comment Nesting Level' ) }>
					{ [ 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map( level =>
						<option value={ level } key={ 'comment-depth-' + level }>{ level }</option>
					) }
			</FormSelect>
		);
	}

	renderInputNumComments() {
		const { clickTracker, fields, isRequestingSettings, onChangeField, typeTracker } = this.props;
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
				disabled={ isRequestingSettings }
				onClick={ clickTracker( 'Comments Per Page Field' ) }
				onKeyPress={ typeTracker( 'Comments Per Page Field' ) } />
		);
	}

	renderInputDisplayDefault() {
		const { fields, isRequestingSettings, onChangeField, translate } = this.props;
		return (
			<FormSelect
				className="is-compact"
				name="default_comments_page"
				style={ { marginTop: '4px' } }
				value={ fields.default_comments_page }
				onChange={ onChangeField( 'default_comments_page' ) }
				disabled={ isRequestingSettings }
				onClick={ this.onTrackSelectAndStop( 'Comment Page Display Default' ) }>
					<option value="newest">{ translate( 'last' ) }</option>
					<option value="oldest">{ translate( 'first' ) }</option>
			</FormSelect>
		);
	}

	emailMeSettings() {
		const { fields, handleToggle, isRequestingSettings, translate } = this.props;
		return (
			<FormFieldset>
				<FormLegend>{ translate( 'E-mail me whenever' ) }</FormLegend>
				<FormToggle
					className="is-compact"
					checked={ !! fields.comments_notify }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'comments_notify' ) }>
					<span>{ translate( 'Anyone posts a comment' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! fields.moderation_notify }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'moderation_notify' ) }>
					<span>{ translate( 'A comment is held for moderation' ) }</span>
				</FormToggle>
				{ this.emailMeLikes() }
				{ this.emailMeReblogs() }
				{ this.emailMeFollows() }
			</FormFieldset>
		);
	}

	emailMeLikes() {
		const { fields, handleToggle, isJetpack, isLikesModuleActive, isRequestingSettings, translate } = this.props;
		// likes are only supported on jetpack sites with the Likes module activated
		if ( isJetpack && ! isLikesModuleActive ) {
			return null;
		}

		return (
			<FormToggle
				className="is-compact"
				checked={ !! fields.social_notifications_like }
				disabled={ isRequestingSettings }
				onChange={ handleToggle( 'social_notifications_like' ) }>
				<span>{ translate( 'Someone likes one of my posts' ) }</span>
			</FormToggle>
		);
	}

	emailMeReblogs() {
		const { fields, handleToggle, isJetpack, isRequestingSettings, translate } = this.props;
		// reblogs are not supported on Jetpack sites
		if ( isJetpack ) {
			return null;
		}

		return (
			<FormToggle
				className="is-compact"
				checked={ !! fields.social_notifications_reblog }
				disabled={ isRequestingSettings }
				onChange={ handleToggle( 'social_notifications_reblog' ) }>
				<span>{ translate( 'Someone reblogs one of my posts' ) }</span>
			</FormToggle>
		);
	}

	emailMeFollows() {
		const { fields, handleToggle, isJetpack, isRequestingSettings, translate } = this.props;
		// follows are not supported on Jetpack sites
		if ( isJetpack ) {
			return null;
		}

		return (
			<FormToggle
				className="is-compact"
				checked={ !! fields.social_notifications_subscribe }
				disabled={ isRequestingSettings }
				onChange={ handleToggle( 'social_notifications_subscribe' ) }>
				<span>{ translate( 'Someone follows my blog' ) }</span>
			</FormToggle>
		);
	}

	beforeCommentSettings() {
		const { fields, handleToggle, isRequestingSettings, translate } = this.props;
		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Before a comment appears' ) }</FormLegend>
				<FormToggle
					className="is-compact"
					checked={ !! fields.comment_moderation }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'comment_moderation' ) }>
					<span>{ translate( 'Comment must be manually approved' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! fields.comment_whitelist }
					disabled={ isRequestingSettings }
					onChange={ handleToggle( 'comment_whitelist' ) }>
					<span>{ translate( 'Comment author must have a previously approved comment' ) }</span>
				</FormToggle>
			</FormFieldset>
		);
	}

	commentModerationSettings() {
		const { clickTracker, fields, isRequestingSettings, onChangeField, translate, typeTracker } = this.props;
		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Comment Moderation' ) }</FormLegend>
				<p>{
					translate(
						'Hold a comment in the queue if it contains {{numberOfLinks /}} or more links. ' +
						'(A common characteristic of comment spam is a large number of hyperlinks.)',
						{
							components: {
								numberOfLinks: this.renderInputNumLinks()
							}
						}
					)
				}</p>
				<FormLabel htmlFor="moderation_keys">{
					translate(
						'When a comment contains any of these words in its content, name, URL, e-mail, or IP, it will be ' +
						'held in the {{link}}moderation queue{{/link}}. One word or IP per line. It will match inside words, so "press" ' +
						'will match "WordPress".',
						{
							components: {
								link: <a
									href={ fields.admin_url + 'edit-comments.php?comment_status=moderated' }
									target="_blank"
									rel="noopener noreferrer" />
							}
						}
					)
				}</FormLabel>
				<FormTextarea
					name="moderation_keys"
					id="moderation_keys"
					value={ fields.moderation_keys }
					onChange={ onChangeField( 'moderation_keys' ) }
					disabled={ isRequestingSettings }
					autoCapitalize="none"
					onClick={ clickTracker( 'Moderation Queue Field' ) }
					onKeyPress={ typeTracker( 'Moderation Queue Field' ) }>
				</FormTextarea>
			</FormFieldset>
		);
	}

	commentBlacklistSettings() {
		const { clickTracker, fields, isRequestingSettings, onChangeField, translate, typeTracker } = this.props;
		return (
			<FormFieldset>
				<FormLegend>{ translate( 'Comment Blacklist' ) }</FormLegend>
				<FormLabel htmlFor="blacklist_keys">{ translate(
					'When a comment contains any of these words in its content, name, URL, e-mail, or IP, it will be marked as spam. ' +
					'One word or IP per line. It will match inside words, so "press" will match "WordPress".'
				) }</FormLabel>
				<FormTextarea
					name="blacklist_keys"
					id="blacklist_keys"
					value={ fields.blacklist_keys }
					onChange={ onChangeField( 'blacklist_keys' ) }
					disabled={ isRequestingSettings }
					autoCapitalize="none"
					onClick={ clickTracker( 'Blacklist Field' ) }
					onKeyPress={ typeTracker( 'Blacklist Field' ) }>
				</FormTextarea>
			</FormFieldset>
		);
	}

	renderInputNumLinks() {
		const { clickTracker, fields, isRequestingSettings, onChangeField, typeTracker } = this.props;
		return (
			<FormTextInput
				name="comment_max_links"
				type="number"
				step="1"
				min="0"
				className="small-text"
				value={ 'undefined' === typeof fields.comment_max_links ? 2 : fields.comment_max_links }
				onChange={ onChangeField( 'comment_max_links' ) }
				disabled={ isRequestingSettings }
				onClick={ clickTracker( 'Comment Queue Link Count Field' ) }
				onKeyPress={ typeTracker( 'Comment Queue Link Count Field' ) } />
		);
	}

	renderSectionHeader( title, showButton = true ) {
		const { handleSubmitForm, isRequestingSettings, isSavingSettings, translate } = this.props;
		return (
			<SectionHeader label={ title }>
				{ showButton &&
					<Button
						compact
						primary
						onClick={ handleSubmitForm }
						disabled={ isRequestingSettings || isSavingSettings }>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				}
			</SectionHeader>
		);
	}

	render() {
		const { handleSubmitForm, translate } = this.props;
		return (
			<form id="site-settings" onSubmit={ handleSubmitForm } onChange={ this.props.markChanged }>
				{ this.renderSectionHeader( translate( 'Default Article Settings' ) ) }
				<Card className="site-settings__discussion-settings">
					{ this.defaultArticleSettings() }
				</Card>

				{ this.renderSectionHeader( translate( 'Comments' ) ) }
				<Card className="site-settings__discussion-settings">
					{ this.otherCommentSettings() }
					<hr />
					{ this.emailMeSettings() }
					<hr />
					{ this.beforeCommentSettings() }
					<hr />
					{ this.commentModerationSettings() }
					<hr />
					{ this.commentBlacklistSettings() }
				</Card>
			</form>
		);
	}
}

const connectComponent = connect(
	( state, { siteId } ) => {
		const isJetpack = isJetpackSite( state, siteId );
		const isLikesModuleActive = isJetpackModuleActive( state, siteId, 'likes' );

		return {
			isJetpack,
			isLikesModuleActive,
		};
	}
);

const getFormSettings = settings => {
	if ( ! settings ) {
		return {};
	}

	const discussionAttributes = [
		'default_pingback_flag',
		'default_ping_status',
		'default_comment_status',
		'require_name_email',
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
		'social_notifications_like',
		'social_notifications_reblog',
		'social_notifications_subscribe',
		'comment_moderation',
		'comment_whitelist',
		'comment_max_links',
		'moderation_keys',
		'blacklist_keys',
		'admin_url',
		'wpcom_publish_comments_with_markdown',
		'markdown_supported',
	];

	return discussionAttributes.reduce( ( memo, attribute ) => {
		memo[ attribute ] = settings[ attribute ];
		return memo;
	}, {} );
};

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormDiscussion );
