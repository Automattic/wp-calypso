/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import formBase from './form-base';
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
import { protectForm } from 'lib/protect-form';

const debug = debugFactory( 'calypso:my-sites:site-settings' );

const SiteSettingsFormDiscussion = protectForm( React.createClass( {
	mixins: [ formBase ],

	discussionAttributes: [
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
	],

	getSettingsFromSite( siteInstance ) {
		const site = siteInstance || this.props.site,
			settings = {};

		if ( site.settings ) {
			this.discussionAttributes.map( attribute => {
				settings[ attribute ] = site.settings[ attribute ];
			} );
		}

		settings.fetchingSettings = site.fetchingSettings;

		return settings;
	},

	resetState() {
		const clearSettings = { fetchingSettings: true };
		this.discussionAttributes.forEach( attribute => {
			clearSettings[ attribute ] = '';
		} );
		this.replaceState( clearSettings );
		debug( 'resetting state' );
	},

	setDirtyField( key ) {
		const newState = {};
		const dirtyFields = this.state.dirtyFields || [];
		if ( dirtyFields.indexOf( key ) === -1 ) {
			newState.dirtyFields = [ ...dirtyFields, key ];
		}
		this.setState( newState );
	},

	handleText( event ) {
		const currentTargetName = event.currentTarget.name,
			currentTargetValue = event.currentTarget.value;

		this.setDirtyField( currentTargetName );
		this.setState( { [ currentTargetName ]: currentTargetValue } );
	},

	handleToggle( name ) {
		return () => {
			this.recordEvent.bind( this, `Toggled ${ name }` );
			this.setDirtyField( name );
			this.setState( { [ name ]: ! this.state[ name ] } );
		};
	},

	handleCommentOrder() {
		this.recordEvent.bind( this, 'Toggled Comment Order on Page' );
		this.setDirtyField( 'comment_order' );
		this.setState( { comment_order: this.state.comment_order === 'desc' ? 'asc' : 'desc' } );
	},

	defaultArticleSettings() {
		return (
			<FormFieldset>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.default_pingback_flag }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'default_pingback_flag' ) }>
					<span>{ this.translate( 'Attempt to notify any blogs linked to from the article' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.default_ping_status }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'default_ping_status' ) }>
					<span>{ this.translate( 'Allow link notifications from other blogs (pingbacks and trackbacks)' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.default_comment_status }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'default_comment_status' ) }>
					<span>{ this.translate( 'Allow people to post comments on new articles' ) }</span>
				</FormToggle>
				<FormSettingExplanation>
					{ this.translate( '(These settings may be overridden for individual articles.)' ) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	},

	otherCommentSettings() {
		const markdownSupported = this.state.markdown_supported;
		return (
			<FormFieldset className="site-settings__other-comment-settings">
				<FormToggle
					className="is-compact"
					checked={ !! this.state.require_name_email }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'require_name_email' ) }>
					<span>{ this.translate( 'Comment author must fill out name and e-mail' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.comment_registration }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'comment_registration' ) }>
					<span>{ this.translate( 'Users must be registered and logged in to comment' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.close_comments_for_old_posts }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'close_comments_for_old_posts' ) }>
					<span>
						{
							this.translate(
								'Automatically close comments on articles older than {{numberOfDays /}} day',
								'Automatically close comments on articles older than {{numberOfDays /}} days', {
									count: this.state.close_comments_days_old || 2,
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
					checked={ !! this.state.thread_comments }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'thread_comments' ) }>
					<span>
						{
							this.translate( 'Enable threaded (nested) comments up to {{number /}} levels deep', {
								components: {
									number: this.renderInputThreadDepth()
								}
							} )
						}
					</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.page_comments }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'page_comments' ) }>
					<span>
						{
							this.translate(
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
						checked={ !! this.state.wpcom_publish_comments_with_markdown }
						disabled={ this.state.fetchingSettings }
						onChange={ this.handleToggle( 'wpcom_publish_comments_with_markdown' ) }>
						<span>
							{
								this.translate( 'Enable Markdown for comments. {{a}}Learn more about markdown{{/a}}.', {
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
					checked={ 'asc' === this.state.comment_order }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleCommentOrder }>
					<span>{ this.translate( 'Comments should be displayed with the older comments at the top of each page' ) }</span>
				</FormToggle>
			</FormFieldset>
		);
	},

	renderInputNumberDays() {
		return (
			<FormTextInput
				name="close_comments_days_old"
				type="number"
				min="0"
				step="1"
				id="close_comments_days_old"
				className="small-text"
				value={ 'undefined' === typeof this.state.close_comments_days_old ? 14 : this.state.close_comments_days_old }
				onChange={ this.handleText }
				disabled={ this.state.fetchingSettings }
				onClick={ this.recordEvent.bind( this, 'Clicked Automatically Close Days Field' ) }
				onKeyPress={ this.recordEventOnce.bind(
					this,
					'typedAutoCloseDays',
					'Typed in Automatically Close Days Field'
				) } />
		);
	},

	renderInputThreadDepth() {
		return (
			<FormSelect
				className="is-compact"
				name="thread_comments_depth"
				value={ this.state.thread_comments_depth }
				onChange={ this.handleText }
				disabled={ this.state.fetchingSettings }
				onClick={ this.recordClickEventAndStop.bind( this, 'Selected Comment Nesting Level' ) }>
					{ [ 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map( level =>
						<option value={ level } key={ 'comment-depth-' + level }>{ level }</option>
					) }
			</FormSelect>
		);
	},

	renderInputNumComments() {
		return (
			<FormTextInput
				name="comments_per_page"
				type="number"
				step="1"
				min="0"
				id="comments_per_page"
				value={ 'undefined' === typeof this.state.comments_per_page ? 50 : this.state.comments_per_page }
				onChange={ this.handleText }
				className="small-text"
				disabled={ this.state.fetchingSettings }
				onClick={ this.recordEvent.bind( this, 'Clicked Comments Per Page Field' ) }
				onKeyPress={ this.recordEventOnce.bind(
					this,
					'typedCommentsPerPage',
					'Typed in Comments Per Page Field'
				) } />
		);
	},

	renderInputDisplayDefault() {
		return (
			<FormSelect
				className="is-compact"
				name="default_comments_page"
				style={ { marginTop: '4px' } }
				value={ this.state.default_comments_page }
				onChange={ this.handleText }
				disabled={ this.state.fetchingSettings }
				onClick={ this.recordClickEventAndStop.bind( this, 'Selected Comment Page Display Default' ) }>
					<option value="newest">{ this.translate( 'last' ) }</option>
					<option value="oldest">{ this.translate( 'first' ) }</option>
			</FormSelect>
		);
	},

	emailMeSettings() {
		return (
			<FormFieldset>
				<FormLegend>{ this.translate( 'E-mail me whenever' ) }</FormLegend>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.comments_notify }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'comments_notify' ) }>
					<span>{ this.translate( 'Anyone posts a comment' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.moderation_notify }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'moderation_notify' ) }>
					<span>{ this.translate( 'A comment is held for moderation' ) }</span>
				</FormToggle>
				{ this.emailMeLikes() }
				{ this.emailMeReblogs() }
				{ this.emailMeFollows() }
			</FormFieldset>
		);
	},

	emailMeLikes() {
		// likes are only supported on jetpack sites with the Likes module activated
		if ( this.props.site.jetpack && ! this.props.site.isModuleActive( 'likes' ) ) {
			return null;
		}

		return (
			<FormToggle
				className="is-compact"
				checked={ !! this.state.social_notifications_like }
				disabled={ this.state.fetchingSettings }
				onChange={ this.handleToggle( 'social_notifications_like' ) }>
				<span>{ this.translate( 'Someone likes one of my posts' ) }</span>
			</FormToggle>
		);
	},

	emailMeReblogs() {
		// reblogs are not supported on Jetpack sites
		if ( this.props.site.jetpack ) {
			return null;
		}

		return (
			<FormToggle
				className="is-compact"
				checked={ !! this.state.social_notifications_reblog }
				disabled={ this.state.fetchingSettings }
				onChange={ this.handleToggle( 'social_notifications_reblog' ) }>
				<span>{ this.translate( 'Someone reblogs one of my posts' ) }</span>
			</FormToggle>
		);
	},

	emailMeFollows() {
		// follows are not supported on Jetpack sites
		if ( this.props.site.jetpack ) {
			return null;
		}

		return (
			<FormToggle
				className="is-compact"
				checked={ !! this.state.social_notifications_subscribe }
				disabled={ this.state.fetchingSettings }
				onChange={ this.handleToggle( 'social_notifications_subscribe' ) }>
				<span>{ this.translate( 'Someone follows my blog' ) }</span>
			</FormToggle>
		);
	},

	beforeCommentSettings() {
		return (
			<FormFieldset>
				<FormLegend>{ this.translate( 'Before a comment appears' ) }</FormLegend>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.comment_moderation }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'comment_moderation' ) }>
					<span>{ this.translate( 'Comment must be manually approved' ) }</span>
				</FormToggle>
				<FormToggle
					className="is-compact"
					checked={ !! this.state.comment_whitelist }
					disabled={ this.state.fetchingSettings }
					onChange={ this.handleToggle( 'comment_whitelist' ) }>
					<span>{ this.translate( 'Comment author must have a previously approved comment' ) }</span>
				</FormToggle>
			</FormFieldset>
		);
	},

	commentModerationSettings() {
		return (
			<FormFieldset>
				<FormLegend>{ this.translate( 'Comment Moderation' ) }</FormLegend>
				<p>{
					this.translate(
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
					this.translate(
						'When a comment contains any of these words in its content, name, URL, e-mail, or IP, it will be ' +
						'held in the {{link}}moderation queue{{/link}}. One word or IP per line. It will match inside words, so "press" ' +
						'will match "WordPress".',
						{
							components: {
								link: <a
									href={ this.state.admin_url + 'edit-comments.php?comment_status=moderated' }
									target="_blank"
									rel="noopener noreferrer" />
							}
						}
					)
				}</FormLabel>
				<FormTextarea
					name="moderation_keys"
					id="moderation_keys"
					value={ this.state.moderation_keys }
					onChange={ this.handleText }
					disabled={ this.state.fetchingSettings }
					autoCapitalize="none"
					onClick={ this.recordEvent.bind( this, 'Clicked Moderation Queue Field' ) }
					onKeyPress={ this.recordEventOnce.bind( this, 'typedModerationKeys', 'Typed In Moderation Queue Field' ) }>
				</FormTextarea>
			</FormFieldset>
		);
	},

	commentBlacklistSettings() {
		return (
			<FormFieldset>
				<FormLegend>{ this.translate( 'Comment Blacklist' ) }</FormLegend>
				<FormLabel htmlFor="blacklist_keys">{ this.translate(
					'When a comment contains any of these words in its content, name, URL, e-mail, or IP, it will be marked as spam. ' +
					'One word or IP per line. It will match inside words, so "press" will match "WordPress".'
				) }</FormLabel>
				<FormTextarea
					name="blacklist_keys"
					id="blacklist_keys"
					value={ this.state.blacklist_keys }
					onChange={ this.handleText }
					disabled={ this.state.fetchingSettings }
					autoCapitalize="none"
					onClick={ this.recordEvent.bind( this, 'Clicked Blacklist Field' ) }
					onKeyPress={ this.recordEventOnce.bind( this, 'typedBlacklistKeys', 'Typed In Blacklist Field' ) }>
				</FormTextarea>
			</FormFieldset>
		);
	},

	renderInputNumLinks() {
		return (
			<FormTextInput
				name="comment_max_links"
				type="number"
				step="1"
				min="0"
				className="small-text"
				value={ 'undefined' === typeof this.state.comment_max_links ? 2 : this.state.comment_max_links }
				onChange={ this.handleText }
				disabled={ this.state.fetchingSettings }
				onClick={ this.recordEvent.bind( this, 'Clicked Comment Queue Link Count Field' ) }
				onKeyPress={ this.recordEventOnce.bind( this, 'typedCommentQueue', 'Typed In Comment Queue Link Count Field' ) } />
		);
	},

	renderSectionHeader( title, showButton = true ) {
		return (
			<SectionHeader label={ title }>
				{ showButton &&
					<Button
						compact
						primary
						onClick={ this.handleSubmitForm }
						disabled={ this.state.fetchingSettings || this.state.submittingForm }>
						{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
					</Button>
				}
			</SectionHeader>
		);
	},

	render() {
		return (
			<form id="site-settings" onSubmit={ this.handleSubmitForm } onChange={ this.props.markChanged }>
				{ this.renderSectionHeader( this.translate( 'Default Article Settings' ) ) }
				<Card className="site-settings__discussion-settings">
					{ this.defaultArticleSettings() }
				</Card>

				{ this.renderSectionHeader( this.translate( 'Comments' ) ) }
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
} ) );

export default SiteSettingsFormDiscussion;
