/**
 * External dependencies
 */
var React = require( 'react' ),
	some = require( 'lodash/some' ),
	xor = require( 'lodash/xor' );

/**
 * Internal dependencies
 */
var MultiCheckbox = require( 'components/forms/multi-checkbox' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {
	displayName: 'SharingButtonsOptions',

	propTypes: {
		site: React.PropTypes.object.isRequired,
		buttons: React.PropTypes.array,
		postTypes: React.PropTypes.array,
		values: React.PropTypes.object,
		onChange: React.PropTypes.func,
		initialized: React.PropTypes.bool,
		saving: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			values: Object.freeze( {} ),
			onChange: function() {},
			initialized: false,
			saving: false
		};
	},

	getSanitizedTwitterUsername: function( username ) {
		return username ? '@' + username.replace( /\W/g, '' ).substr( 0, 15 ) : '';
	},

	trackTwitterViaAnalyticsEvent: function() {
		analytics.ga.recordEvent( 'Sharing', 'Focussed Twitter Username Field' );
	},

	handleMultiCheckboxChange: function( name, event ) {
		var delta = xor( this.props.values.sharing_show, event.value ),
			checked;

		this.props.onChange( name, event.value.length ? event.value : null );

		if ( delta.length ) {
			checked = -1 !== event.value.indexOf( delta[0] );
			analytics.ga.recordEvent( 'Sharing', 'Clicked Show Sharing Buttons On Page Checkbox', delta[0], checked ? 1 : 0 );
		}
	},

	handleTwitterViaChange: function( event ) {
		this.props.onChange( event.target.name, this.getSanitizedTwitterUsername( event.target.value ) );
	},

	handleChange: function( event ) {
		var value;
		if ( 'checkbox' === event.target.type ) {
			value = event.target.checked;
		} else {
			value = event.target.value;
		}

		if ( 'jetpack_comment_likes_enabled' === event.target.name ) {
			analytics.ga.recordEvent( 'Sharing', 'Clicked Comment Likes On For All Posts Checkbox', 'checked', event.target.checked ? 1 : 0 );
		}

		this.props.onChange( event.target.name, value );
	},

	getPostTypeLabel: function( postType ) {
		var label;

		switch ( postType.slug ) {
			case 'index': label = this.translate( 'Front Page, Archive Pages, and Search Results', { context: 'jetpack' } ); break;
			case 'post': label = this.translate( 'Posts' ); break;
			case 'page': label = this.translate( 'Pages' ); break;
			case 'attachment': label = this.translate( 'Media' ); break;
			case 'portfolio': label = this.translate( 'Portfolio Items' ); break;
			default: label = postType.name;
		}

		return label;
	},

	getDisplayOptions: function() {
		return [
			{ name: 'index' }
		].concat( this.props.postTypes ).map( function( postType ) {
			return {
				value: postType.slug,
				label: this.getPostTypeLabel( postType )
			};
		}, this );
	},

	isTwitterButtonEnabled: function() {
		return some( this.props.buttons, { ID: 'twitter', enabled: true } );
	},

	getTwitterViaOptionElement: function() {
		var option;

		if ( ! this.isTwitterButtonEnabled() || ( this.props.site.jetpack && this.props.site.versionCompare( '3.4-dev', '<' ) ) ) {
			return;
		}

		option = this.props.site.jetpack ? 'jetpack-twitter-cards-site-tag' : 'twitter_via';

		return (
			<fieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">{ this.translate( 'Twitter username' ) }</legend>
				<input
					name={ option }
					type="text"
					placeholder={ '@' + this.translate( 'username', { textOnly: true } ) }
					value={ this.getSanitizedTwitterUsername( this.props.values[ option ] ) }
					onChange={ this.handleTwitterViaChange }
					onFocus={ this.trackTwitterViaAnalyticsEvent }
					disabled={ ! this.props.initialized } />
				<p className="sharing-buttons__fieldset-detail">
					{ this.translate( 'This will be included in tweets when people share using the Twitter button.' ) }
				</p>
			</fieldset>
		);
	},

	getCommentLikesOptionElement: function() {
		if ( this.props.site.jetpack ) {
			return;
		}

		return (
			<fieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">
					{ this.translate( 'Comment Likes', { context: 'Sharing options: Header' } ) }
				</legend>
				<label>
					<input name="jetpack_comment_likes_enabled" type="checkbox" checked={ this.props.values.jetpack_comment_likes_enabled } onChange={ this.handleChange } disabled={ ! this.props.initialized } />
					<span>{ this.translate( 'On for all posts', { context: 'Sharing options: Comment Likes' } ) }</span>
				</label>
			</fieldset>
		);
	},

	render: function() {
		return (
			<div className="sharing-buttons__panel">
				<h4>{ this.translate( 'Options' ) }</h4>
				<div className="sharing-buttons__fieldset-group">
					<fieldset className="sharing-buttons__fieldset">
						<legend className="sharing-buttons__fieldset-heading">
							{ this.translate( 'Show sharing buttons on', {
								context: 'Sharing options: Header',
								comment: 'Possible values are: "Front page, Archive Pages, and Search Results", "Posts", "Pages", "Media"'
							} ) }
						</legend>
						<MultiCheckbox name="sharing_show" options={ this.getDisplayOptions() } checked={ this.props.values.sharing_show } onChange={ this.handleMultiCheckboxChange.bind( null, 'sharing_show' ) } disabled={ ! this.props.initialized } />
					</fieldset>
					{ this.getCommentLikesOptionElement() }
					{ this.getTwitterViaOptionElement() }
				</div>

				<button type="submit" className="button is-primary sharing-buttons__submit" disabled={ this.props.saving || ! this.props.initialized }>
					{ this.props.saving ? this.translate( 'Saving…' ) : this.translate( 'Save Changes' ) }
				</button>
			</div>
		);
	}
} );
