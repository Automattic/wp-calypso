/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' );

/**
 * Internal dependencies
 */
var formBase = require( './form-base' ),
	protectForm = require( 'lib/mixins/protect-form' ),
	dirtyLinkedState = require( 'lib/mixins/dirty-linked-state' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormLegend = require( 'components/forms/form-legend' ),
	FormTextarea = require( 'components/forms/form-textarea' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	FormCheckbox = require( 'components/forms/form-checkbox' ),
	FormSelect = require( 'components/forms/form-select' ),
	FormSettingExplanation = require( 'components/forms/form-setting-explanation' ),
	Card = require( 'components/card' ),
	Button = require( 'components/button' ),
	SectionHeader = require( 'components/section-header' );

module.exports = React.createClass( {

	displayName: 'SiteSettingsFormDiscussion',

	mixins: [ dirtyLinkedState, protectForm.mixin, formBase ],

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

	getSettingsFromSite: function( siteInstance ) {
		var site = siteInstance || this.props.site,
			settings = {};

		if ( site.settings ) {
			this.discussionAttributes.map( function( attribute ) {
				settings[ attribute ] = site.settings[ attribute ];
			}, this );
		}

		settings.fetchingSettings = site.fetchingSettings;

		return settings;
	},

	resetState: function() {
		var clearSettings = { fetchingSettings: true };
		this.discussionAttributes.forEach( function( attribute ) {
			clearSettings[ attribute ] = '';
		} );
		this.replaceState( clearSettings );
		debug( 'resetting state' );
	},

	defaultArticleSettings: function() {
		return (
			<FormFieldset>
				<FormLegend>{ this.translate( 'Default article settings' ) }</FormLegend>
				<FormLabel>
					<FormCheckbox
						name="default_pingback_flag"
						checkedLink={ this.linkState( 'default_pingback_flag' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Attempt to Notify Checkbox' ) } />
					<span>{ this.translate( 'Attempt to notify any blogs linked to from the article' ) }</span>
				</FormLabel>
				<FormLabel>
					<FormCheckbox
						name="default_ping_status"
						checkedLink={ this.linkState( 'default_ping_status' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Allow Link Notifications Checkbox' ) } />
					<span>{ this.translate( 'Allow link notifications from other blogs (pingbacks and trackbacks)' ) }</span>
				</FormLabel>
				<FormLabel>
					<FormCheckbox
						name="default_comment_status"
						checkedLink={ this.linkState( 'default_comment_status' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Allow People to Post Comments Checkbox' ) } />
					<span>{ this.translate( 'Allow people to post comments on new articles' ) }</span>
				</FormLabel>
				<FormSettingExplanation>
						{ this.translate( '(These settings may be overridden for individual articles.)' ) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	},

	otherCommentSettings: function() {
		const markdownSupported = this.state.markdown_supported;
		return (
			<FormFieldset className="has-divider">
				<FormLabel>{ this.translate( 'Other comment settings' ) }</FormLabel>
				<FormLabel>
					<FormCheckbox
						name="require_name_email"
						checkedLink={ this.linkState( 'require_name_email' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Comment Author Must Fill Checkbox' ) } />
					<span>{ this.translate( 'Comment author must fill out name and e-mail' ) }</span>
				</FormLabel>
				<FormLabel>
					<FormCheckbox
						name="comment_registration"
						checkedLink={ this.linkState( 'comment_registration' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Users Must Be Registered Checkbox' ) } />
					<span>{ this.translate( 'Users must be registered and logged in to comment' ) }</span>
				</FormLabel>
				<FormLabel>
					<FormCheckbox
						name="close_comments_for_old_posts"
						checkedLink={ this.linkState( 'close_comments_for_old_posts' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Automatically Close Days Checkbox' ) } />
					<span>{
						this.translate(
							'Automatically close comments on articles older than {{numberOfDays /}} day',
							'Automatically close comments on articles older than {{numberOfDays /}} days', {
								count: this.state.close_comments_days_old || 2,
								components: {
									numberOfDays: <FormTextInput
										name="close_comments_days_old"
										type="number"
										min="0"
										step="1"
										id="close_comments_days_old"
										className="small-text"
										valueLink={ this.linkState( 'close_comments_days_old' ) }
										disabled={ this.state.fetchingSettings }
										onClick={ this.recordEvent.bind( this, 'Clicked Automatically Close Days Field' ) }
										onKeyPress={ this.recordEventOnce.bind( this, 'typedAutoCloseDays', 'Typed in Automatically Close Days Field' ) } />
								}
							} )
						}</span>
				</FormLabel>
				<FormLabel>
					<FormCheckbox
						name="thread_comments"
						checkedLink={ this.linkState( 'thread_comments' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Enable Threaded Checkbox' ) } />
					<span>{
						this.translate( 'Enable threaded (nested) comments up to {{number /}} levels deep', {
							components: {
								number: <FormSelect
									className="is-compact"
									name="thread_comments_depth"
									valueLink={ this.linkState( 'thread_comments_depth' ) }
									disabled={ this.state.fetchingSettings }
									onClick={ this.recordClickEventAndStop.bind( this, 'Selected Comment Nesting Level' ) }>
										{ [ 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map( level =>
											<option value={ level } key={ 'comment-depth-' + level }>{ level }</option>
										) }
								</FormSelect>
							}
						} )
						}</span>
				</FormLabel>
				<FormLabel>
					<FormCheckbox
						name="page_comments"
						id="page_comments"
						checkedLink={ this.linkState( 'page_comments' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Break Comments Into Pages Checkbox' ) } />
					<span>{
						this.translate( 'Break comments into pages with {{numComments /}} top level comments per page and the {{firstOrLast /}} page displayed by default', {
							components: {
								numComments: <FormTextInput
									name="comments_per_page"
									type="number"
									step="1"
									min="0"
									id="comments_per_page"
									valueLink={ this.linkState( 'comments_per_page' ) }
									className="small-text"
									disabled={ this.state.fetchingSettings }
									onClick={ this.recordEvent.bind( this, 'Clicked Comments Per Page Field' ) }
									onKeyPress={ this.recordEventOnce.bind( this, 'typedCommentsPerPage', 'Typed in Comments Per Page Field' ) } />,
								firstOrLast: <FormSelect
									className="is-compact"
									name="default_comments_page"
									valueLink={ this.linkState( 'default_comments_page' ) }
									disabled={ this.state.fetchingSettings }
									onClick={ this.recordClickEventAndStop.bind( this, 'Selected Comment Page Display Default' ) }>
										<option value="newest">{ this.translate( 'last' ) }</option>
										<option value="oldest">{ this.translate( 'first' ) }</option>
								</FormSelect>
							}
						} )
						}</span>
				</FormLabel>
				{ markdownSupported &&
					<FormLabel>
						<FormCheckbox
							name="wpcom_publish_comments_with_markdown"
							checkedLink={ this.linkState( 'wpcom_publish_comments_with_markdown' ) }
							disabled={ this.state.fetchingSettings }
							onClick={ this.recordEvent.bind( this, 'Clicked Markdown for Comments Checkbox' ) } />
						<span>{ this.translate( 'Enable Markdown for comments. {{a}}Learn more about markdown{{/a}}.', {
								components: {
									a: <a href="http://en.support.wordpress.com/markdown-quick-reference/" target="_blank" />
								}
							} ) }</span>
					</FormLabel>
				}
				<FormLabel>
					<span>{
						this.translate( 'Comments should be displayed with the {{olderOrNewer /}} comments at the top of each page', {
							components: {
								olderOrNewer: <FormSelect
									className="is-compact"
									name="comment_order"
									valueLink={ this.linkState( 'comment_order' ) }
									disabled={ this.state.fetchingSettings }
									onClick={ this.recordEvent.bind( this, 'Selected Comment Order on Page' ) }>
										<option value="asc">{ this.translate( 'older', { textOnly: true } ) }</option>
										<option value="desc">{ this.translate( 'newer', { textOnly: true } ) }</option>
								</FormSelect>
							}
						} )
						}</span>
				</FormLabel>
			</FormFieldset>
		);
	},

	emailMeSettings: function() {
		return (
			<FormFieldset>
				<FormLegend>{ this.translate( 'E-mail me whenever' ) }</FormLegend>
				<FormLabel className="short-settings">
					<FormCheckbox
						name="comments_notify"
						checkedLink={ this.linkState( 'comments_notify' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Anyone Posts a Comment Checkbox' ) } />
					<span>{ this.translate( 'Anyone posts a comment' ) }</span>
				</FormLabel>
				<FormLabel className="short-settings">
					<FormCheckbox
						name="moderation_notify"
						checkedLink={ this.linkState( 'moderation_notify' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked a Comment is Held Checkbox' ) } />
					<span>{ this.translate( 'A comment is held for moderation' ) }</span>
				</FormLabel>
				{ this.emailMeLikes() }
				{ this.emailMeReblogs() }
				{ this.emailMeFollows() }
			</FormFieldset>
		);
	},

	emailMeLikes: function() {
		// likes are only supported on jetpack sites with the Likes module activated
		if ( this.props.site.jetpack && ! this.props.site.isModuleActive( 'likes' ) ) {
			return null;
		}

		return (
			<FormLabel className="short-settings">
				<FormCheckbox
					name="social_notifications_like"
					checkedLink={ this.linkState( 'social_notifications_like' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Someone Likes Checkbox' ) } />
				<span>{ this.translate( 'Someone likes one of my posts' ) }</span>
			</FormLabel>
		);
	},

	emailMeReblogs: function() {
		// reblogs are not supported on Jetpack sites
		if ( this.props.site.jetpack ) {
			return null;
		}

		return (
			<FormLabel className="short-settings">
				<FormCheckbox
					name="social_notifications_reblog"
					checkedLink={ this.linkState( 'social_notifications_reblog' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Someone Reblogs Checkbox' ) } />
				<span>{ this.translate( 'Someone reblogs one of my posts' ) }</span>
			</FormLabel>
		);
	},

	emailMeFollows: function() {
		// follows are not supported on Jetpack sites
		if ( this.props.site.jetpack ) {
			return null;
		}

		return (
			<FormLabel className="short-settings">
				<FormCheckbox
					name="social_notifications_subscribe"
					checkedLink={ this.linkState( 'social_notifications_subscribe' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Someone Follows Checkbox' ) } />
				<span>{ this.translate( 'Someone follows my blog' ) }</span>
			</FormLabel>
		);
	},

	beforeCommentSettings: function() {
		return (
			<FormFieldset>
				<FormLegend>{ this.translate( 'Before a comment appears' ) }</FormLegend>
				<FormLabel className="short-settings">
					<FormCheckbox
						name="comment_moderation"
						checkedLink={ this.linkState( 'comment_moderation' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Comment Manually Approved Checkbox' ) } />
					<span>{ this.translate( 'Comment must be manually approved' ) }</span>
				</FormLabel>
				<FormLabel className="short-settings">
					<FormCheckbox
						name="comment_whitelist"
						checkedLink={ this.linkState( 'comment_whitelist' ) }
						disabled={ this.state.fetchingSettings }
						onClick={ this.recordEvent.bind( this, 'Clicked Comment Previously Approved Checkbox' ) } />
					<span>{ this.translate( 'Comment author must have a previously approved comment' ) }</span>
				</FormLabel>
			</FormFieldset>
		);
	},

	commentModerationSettings: function() {
		return (
			<FormFieldset className="has-divider">
				<FormLabel htmlFor="moderation_keys">{ this.translate( 'Comment Moderation' ) }</FormLabel>
				<p>{
					this.translate( 'Hold a comment in the queue if it contains {{numberOfLinks /}} or more links. (A common characteristic of comment spam is a large number of hyperlinks.)', {
						components: {
							numberOfLinks: <FormTextInput
								name="comment_max_links"
								type="number"
								step="1"
								min="0"
								className="small-text"
								valueLink={ this.linkState( 'comment_max_links' ) }
								disabled={ this.state.fetchingSettings }
								onClick={ this.recordEvent.bind( this, 'Clicked Comment Queue Link Count Field' ) }
								onKeyPress={ this.recordEventOnce.bind( this, 'typedCommentQueue', 'Typed In Comment Queue Link Count Field' ) } />
						}
					} )
				}</p>
				<p>{
					this.translate( 'When a comment contains any of these words in its content, name, URL, e-mail, or IP, it will be held in the {{link}}moderation queue{{/link}}. One word or IP per line. It will match inside words, so "press" will match "WordPress".',
						{
							components: {
								link: <a href={ this.state.admin_url + 'edit-comments.php?comment_status=moderated' } target="_blank" />
							}
						}
					)
					}</p>
				<p>
					<FormTextarea
						name="moderation_keys"
						id="moderation_keys"
						valueLink={ this.linkState( 'moderation_keys' ) }
						disabled={ this.state.fetchingSettings }
						autoCapitalize="none"
						onClick={ this.recordEvent.bind( this, 'Clicked Moderation Queue Field' ) }
						onKeyPress={ this.recordEventOnce.bind( this, 'typedModerationKeys', 'Typed In Moderation Queue Field' ) }>
					</FormTextarea>
				</p>
			</FormFieldset>
		);
	},

	commentBlacklistSettings: function() {
		return (
			<FormFieldset>
				<FormLabel htmlFor="blacklist_keys">{ this.translate( 'Comment Blacklist' ) }</FormLabel>
				<p>{ this.translate( 'When a comment contains any of these words in its content, name, URL, e-mail, or IP, it will be marked as spam. One word or IP per line. It will match inside words, so "press" will match "WordPress".' ) }</p>
				<p>
					<FormTextarea
						name="blacklist_keys"
						id="blacklist_keys"
						valueLink={ this.linkState( 'blacklist_keys' ) }
						disabled={ this.state.fetchingSettings }
						autoCapitalize="none"
						onClick={ this.recordEvent.bind( this, 'Clicked Blacklist Field' ) }
						onKeyPress={ this.recordEventOnce.bind( this, 'typedBlacklistKeys', 'Typed In Blacklist Field' ) }>
					</FormTextarea>
				</p>
			</FormFieldset>
		);
	},

	render: function() {
		return (

			<form id="site-settings" onSubmit={ this.submitForm } onChange={ this.markChanged }>
				<SectionHeader label={ this.translate( 'Discussion Settings' ) }>
					<Button
						primary
						compact
						disabled={ this.state.fetchingSettings || this.state.submittingForm }
						onClick={ this.submitForm }>
						{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card className="discussion-settings">
					{ this.defaultArticleSettings() }
					{ this.otherCommentSettings() }
					{ this.emailMeSettings() }
					{ this.beforeCommentSettings() }
					{ this.commentModerationSettings() }
					{ this.commentBlacklistSettings() }
				</Card>
			</form>
		);
	}
} );
