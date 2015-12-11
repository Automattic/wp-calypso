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
	dirtyLinkedState = require( 'lib/mixins/dirty-linked-state' );

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
		'admin_url'
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
			<fieldset>
				<legend>{ this.translate( 'Default article settings' ) }</legend>
				<label>
					<input
					name="default_pingback_flag"
					type="checkbox"
					checkedLink={ this.linkState( 'default_pingback_flag' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Attempt to Notify Checkbox' ) }
					/>
					<span>{ this.translate( 'Attempt to notify any blogs linked to from the article' ) }</span>
				</label>
				<label>
					<input
					name="default_ping_status"
					type="checkbox"
					checkedLink={ this.linkState( 'default_ping_status' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Allow Link Notifications Checkbox' ) }
					/>
					<span>{ this.translate( 'Allow link notifications from other blogs (pingbacks and trackbacks)' ) }</span>
				</label>
				<label>
					<input
					name="default_comment_status"
					type="checkbox"
					checkedLink={ this.linkState( 'default_comment_status' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Allow People to Post Comments Checkbox' ) }
					/>
					<span>{ this.translate( 'Allow people to post comments on new articles' ) }</span>
				</label>
				<p className="settings-explanation">
						{ this.translate( '(These settings may be overridden for individual articles.)' ) }
				</p>
			</fieldset>
		);
	},

	otherCommentSettings: function() {
		return (
			<fieldset>
				<legend>{ this.translate( 'Other comment settings' ) }</legend>
				<label>
					<input
					name="require_name_email"
					type="checkbox"
					checkedLink={ this.linkState( 'require_name_email' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Comment Author Must Fill Checkbox' ) }
					/>
						<span>{ this.translate( 'Comment author must fill out name and e-mail' ) }</span>
				</label>
				<label>
					<input
					name="comment_registration"
					type="checkbox"
					checkedLink={ this.linkState( 'comment_registration' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Users Must Be Registered Checkbox' ) }
					/>
						<span>{ this.translate( 'Users must be registered and logged in to comment' ) }</span>
				</label>
				<label>
					<input
					name="close_comments_for_old_posts"
					type="checkbox"
					checkedLink={ this.linkState( 'close_comments_for_old_posts' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Automatically Close Days Checkbox' ) }
					/>
					<span>{
						this.translate(
							'Automatically close comments on articles older than {{numberOfDays /}} day',
							'Automatically close comments on articles older than {{numberOfDays /}} days', {
								count: this.state.close_comments_days_old || 2,
								components: {
									numberOfDays: <input
									name="close_comments_days_old"
									type="number"
									min="0"
									step="1"
									id="close_comments_days_old"
									className="small-text"
									valueLink={ this.linkState( 'close_comments_days_old' ) }
									disabled={ this.state.fetchingSettings }
									onClick={ this.recordEvent.bind( this, 'Clicked Automatically Close Days Field' ) }
									onKeyPress={ this.recordEventOnce.bind( this, 'typedAutoCloseDays', 'Typed in Automatically Close Days Field' ) }
									/>
								}
							} )
						}</span>
				</label>
				<label>
					<input
					name="thread_comments"
					type="checkbox"
					checkedLink={ this.linkState( 'thread_comments' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Enable Threaded Checkbox' ) }
					/>
					<span>{
						this.translate( 'Enable threaded (nested) comments up to {{number /}} levels deep', {
							components: {
								number: <select
								className="is-compact"
								name="thread_comments_depth"
								valueLink={ this.linkState( 'thread_comments_depth' ) }
								disabled={ this.state.fetchingSettings }
								onClick={ this.recordClickEventAndStop.bind( this, 'Selected Comment Nesting Level' ) }
								>
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4">4</option>
									<option value="5">5</option>
									<option value="6">6</option>
									<option value="7">7</option>
									<option value="8">8</option>
									<option value="9">9</option>
									<option value="10">10</option>
								</select>
							}
						} )
						}</span>
				</label>
				<label>
					<input
					name="page_comments"
					type="checkbox"
					id="page_comments"
					checkedLink={ this.linkState( 'page_comments' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Break Comments Into Pages Checkbox' ) }
					/>
					<span>{
						this.translate( 'Break comments into pages with {{numComments /}} top level comments per page and the {{firstOrLast /}} page displayed by default', {
							components: {
								numComments: <input
								name="comments_per_page"
								type="number"
								step="1"
								min="0"
								id="comments_per_page"
								valueLink={ this.linkState( 'comments_per_page' ) }
								className="small-text"
								disabled={ this.state.fetchingSettings }
								onClick={ this.recordEvent.bind( this, 'Clicked Comments Per Page Field' ) }
								onKeyPress={ this.recordEventOnce.bind( this, 'typedCommentsPerPage', 'Typed in Comments Per Page Field' ) }
								/>,
								firstOrLast: <select
								className="is-compact"
								name="default_comments_page"
								valueLink={ this.linkState( 'default_comments_page' ) }
								disabled={ this.state.fetchingSettings }
								onClick={ this.recordClickEventAndStop.bind( this, 'Selected Comment Page Display Default' ) }
								>
									<option value="newest">{ this.translate( 'last' ) }</option>
									<option value="oldest">{ this.translate( 'first' ) }</option>
								</select>
							}
						} )
						}</span>
				</label>
				<label>
					<span>{
						this.translate( 'Comments should be displayed with the {{olderOrNewer /}} comments at the top of each page', {
							components: {
								olderOrNewer: <select
								className="is-compact"
								name="comment_order"
								valueLink={ this.linkState( 'comment_order' ) }
								disabled={ this.state.fetchingSettings }
								onClick={ this.recordEvent.bind( this, 'Selected Comment Order on Page' ) }
								>
									<option value="asc">{ this.translate( 'older', { textOnly: true } ) }</option>

									<option value="desc">{ this.translate( 'newer', { textOnly: true } ) }</option>
								</select>
							}
						} )
						}</span>
				</label>
			</fieldset>
		);
	},

	emailMeSettings: function() {
		return (
			<fieldset>
				<legend>{ this.translate( 'E-mail me whenever' ) }</legend>
				<label className="short-settings">
					<input
					name="comments_notify"
					type="checkbox"
					checkedLink={ this.linkState( 'comments_notify' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Anyone Posts a Comment Checkbox' ) }
					/>
					<span>{ this.translate( 'Anyone posts a comment' ) }</span>
				</label>
				<label className="short-settings">
					<input
					name="moderation_notify"
					type="checkbox"
					checkedLink={ this.linkState( 'moderation_notify' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked a Comment is Held Checkbox' ) }
					/>
					<span>{ this.translate( 'A comment is held for moderation' ) }</span>
				</label>
				{ this.emailMeLikes() }
				{ this.emailMeReblogs() }
				{ this.emailMeFollows() }
			</fieldset>
		);
	},

	emailMeLikes: function() {

		// likes are only supported on jetpack sites with the Likes module activated
		if ( this.props.site.jetpack && ! this.props.site.isModuleActive( 'likes' ) ) {
			return null;
		}

		return (
			<label className="short-settings">
				<input
				name="social_notifications_like"
				type="checkbox"
				checkedLink={ this.linkState( 'social_notifications_like' ) }
				disabled={ this.state.fetchingSettings }
				onClick={ this.recordEvent.bind( this, 'Clicked Someone Likes Checkbox' ) }
				/>
				<span>{ this.translate( 'Someone likes one of my posts' ) }</span>
			</label>
		);
	},

	emailMeReblogs: function() {

		// reblogs are not supported on Jetpack sites
		if ( this.props.site.jetpack ) {
			return null;
		}

		return (
			<label className="short-settings">
				<input
				name="social_notifications_reblog"
				type="checkbox"
				checkedLink={ this.linkState( 'social_notifications_reblog' ) }
				disabled={ this.state.fetchingSettings }
				onClick={ this.recordEvent.bind( this, 'Clicked Someone Reblogs Checkbox' ) }
				/>
				<span>{ this.translate( 'Someone reblogs one of my posts' ) }</span>
			</label>
		);
	},

	emailMeFollows: function() {

		// follows are not supported on Jetpack sites
		if ( this.props.site.jetpack ) {
			return null;
		}

		return (
			<label className="short-settings">
				<input
				name="social_notifications_subscribe"
				type="checkbox"
				checkedLink={ this.linkState( 'social_notifications_subscribe' ) }
				disabled={ this.state.fetchingSettings }
				onClick={ this.recordEvent.bind( this, 'Clicked Someone Follows Checkbox' ) }
				/>
				<span>{ this.translate( 'Someone follows my blog' ) }</span>
			</label>
		);
	},

	beforeCommentSettings: function() {
		return (
			<fieldset>
				<legend>{ this.translate( 'Before a comment appears' ) }</legend>
				<label className="short-settings">
					<input
					name="comment_moderation"
					type="checkbox"
					checkedLink={ this.linkState( 'comment_moderation' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Comment Manually Approved Checkbox' ) }
					/>
					<span>{ this.translate( 'Comment must be manually approved' ) }</span>
				</label>
				<label className="short-settings">
					<input
					name="comment_whitelist"
					type="checkbox"
					checkedLink={ this.linkState( 'comment_whitelist' ) }
					disabled={ this.state.fetchingSettings }
					onClick={ this.recordEvent.bind( this, 'Clicked Comment Previously Approved Checkbox' ) }
					/>
					<span>{ this.translate( 'Comment author must have a previously approved comment' ) }</span>
				</label>
			</fieldset>
		);
	},

	commentModerationSettings: function() {
		return (
			<fieldset>
				<label htmlFor="moderation_keys">{ this.translate( 'Comment Moderation' ) }</label>
				<p>{
					this.translate( 'Hold a comment in the queue if it contains {{numberOfLinks /}} or more links. (A common characteristic of comment spam is a large number of hyperlinks.)', {
						components: {
							numberOfLinks: <input
							name="comment_max_links"
							type="number"
							step="1"
							min="0"
							className="small-text"
							valueLink={ this.linkState( 'comment_max_links' ) }
							disabled={ this.state.fetchingSettings }
							onClick={ this.recordEvent.bind( this, 'Clicked Comment Queue Link Count Field' ) }
							onKeyPress={ this.recordEventOnce.bind( this, 'typedCommentQueue', 'Typed In Comment Queue Link Count Field' ) }
							/>
						}
					} )
				}</p>
				<p>{
					this.translate( 'When a comment contains any of these words in its content, name, URL, e-mail, or IP, it will be held in the {{link}}moderation queue{{/link}}. One word or IP per line. It will match inside words, so "press" will match "WordPress".',
						{
							components: {
								link: <a
								href={ this.state.admin_url + 'edit-comments.php?comment_status=moderated' }
								target="_blank"
								/>
							}
						}
					)
					}</p>
				<p>
					<textarea
					name="moderation_keys"
					id="moderation_keys"
					valueLink={ this.linkState( 'moderation_keys' ) }
					disabled={ this.state.fetchingSettings }
					autoCapitalize="none"
					onClick={ this.recordEvent.bind( this, 'Clicked Moderation Queue Field' ) }
					onKeyPress={ this.recordEventOnce.bind( this, 'typedModerationKeys', 'Typed In Moderation Queue Field' ) }
					></textarea>
				</p>
			</fieldset>
		);
	},

	commentBlacklistSettings: function() {
		return (
			<fieldset>
				<label htmlFor="blacklist_keys">{ this.translate( 'Comment Blacklist' ) }</label>
				<p>{ this.translate( 'When a comment contains any of these words in its content, name, URL, e-mail, or IP, it will be marked as spam. One word or IP per line. It will match inside words, so "press" will match "WordPress".' ) }</p>
				<p>
					<textarea
					name="blacklist_keys"
					id="blacklist_keys"
					valueLink={ this.linkState( 'blacklist_keys' ) }
					disabled={ this.state.fetchingSettings }
					autoCapitalize="none"
					onClick={ this.recordEvent.bind( this, 'Clicked Blacklist Field' ) }
					onKeyPress={ this.recordEventOnce.bind( this, 'typedBlacklistKeys', 'Typed In Blacklist Field' ) }
					></textarea>
				</p>
			</fieldset>
		);
	},

	render: function() {
		return (

			<form id="site-settings" onSubmit={ this.submitForm } onChange={ this.markChanged }>
				<button
					type="submit"
					className="button is-primary"
					disabled={ this.state.fetchingSettings || this.state.submittingForm }
				>
					{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
				</button>
				{ this.defaultArticleSettings() }
				{ this.otherCommentSettings() }
				{ this.emailMeSettings() }
				{ this.beforeCommentSettings() }
				{ this.commentModerationSettings() }
				{ this.commentBlacklistSettings() }
				<button
					type="submit"
					className="button is-primary"
					disabled={ this.state.fetchingSettings || this.state.submittingForm } >
						{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' ) }
				</button>
			</form>
		);
	}
} );
