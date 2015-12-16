/**
 * External dependencies
 */
var React = require( 'react/addons' );

/**
 * Internal dependencies
 */
var Dialog = require( 'components/dialog' ),
	PulsingDot = require( 'components/pulsing-dot' ),
	Helpers = require( 'lib/themes/helpers' );

var ThanksModal = React.createClass( {
	trackClick: Helpers.trackClick.bind( null, 'current theme' ),

	propTypes: {
		clearActivated: React.PropTypes.func.isRequired
	},

	onCloseModal: function() {
		this.props.clearActivated();
		this.setState( { show: false } );
	},

	visitSite: function() {
		this.trackClick( 'visit site' );
		window.open( this.props.site.URL );
	},

	goBack: function() {
		this.trackClick( 'go back' );
		this.onCloseModal();
	},

	renderWpcomInfo: function() {
		return (
			<ul>
				<li>
					{ this.translate( "Discover this theme's {{a}}awesome features.{{/a}}", {
						components: {
							a: <a href={ Helpers.getDetailsUrl( this.props.currentTheme, this.props.site ) } target="_blank" />
						}
					} ) }
				</li>
			<li>
				{ this.translate( 'Have questions? Stop by our {{a}}support forums.{{/a}}', {
					components: {
						a: <a href={ Helpers.getForumUrl( this.props.currentTheme ) } target="_blank" />
					}
				} ) }
			</li>
			</ul>
		);
	},

	renderWporgThemeInfo: function( themeUri ) {
		if ( themeUri ) {
			return (
				<li>
					{ this.translate( 'Learn more about this {{a}}awesome theme{{/a}}.', {
						components: {
							a: <a href={ themeUri } target="_blank" />
						}
					} ) }
				</li>
			);
		}
	},

	renderWporgAuthorInfo: function( authorUri ) {
		if ( authorUri ) {
			return (
				<li>
					{ this.translate( 'Have questions? {{a}}Contact the theme author.{{/a}}', {
						components: {
							a: <a href={ authorUri } target="_blank" />
						}
					} ) }
				</li>
			);
		}
	},

	renderWporgForumInfo: function() {
		return (
			<li>
				{ this.translate( 'If you need support, visit the WordPress.org {{a}}Themes forum{{/a}}.', {
					components: {
						a: <a href="https://wordpress.org/support/forum/themes-and-templates" target="_blank" />
					}
				} ) }
			</li>
		);
	},

	renderJetpackInfo: function() {
		const themeUri = this.props.currentTheme.theme_uri;
		const authorUri = this.props.currentTheme.author_uri;

		return (
			<ul>
				{ themeUri ? this.renderWporgThemeInfo( themeUri ) : null }
				{ authorUri ? this.renderWporgAuthorInfo( authorUri ) : null }
				{ ! themeUri || ! authorUri ? this.renderWporgForumInfo() : null }
			</ul>
		);
	},

	renderContent: function() {
		return (
			<div>
				<h1>
					{ this.translate( 'Thanks for choosing {{br/}} %(themeName)s {{br/}} by %(themeAuthor)s', {
						args: {
							themeName: this.props.currentTheme.name,
							themeAuthor: this.props.currentTheme.author
						},
						components: {
							br: <br />
						}
					} ) }
				</h1>
				<ul>

					{ this.props.site.jetpack ? this.renderJetpackInfo() : this.renderWpcomInfo() }
				</ul>
			</div>
		);
	},

	renderLoading: function() {
		return (
			<div>
				<PulsingDot active={ true } />
			</div>
		);
	},

	render: function() {
		var buttons;

		buttons = [
			{ action: 'back', label: this.translate( 'Back to themes' ), onClick: this.goBack },
			{ action: 'visitSite', label: this.translate( 'Visit site' ), isPrimary: true, onClick: this.visitSite },
		];

		return (
			<Dialog className="themes-thanks-modal" isVisible={ this.props.isActivating || this.props.hasActivated } buttons={ buttons } onClose={ this.onCloseModal } >
				{ this.props.hasActivated ? this.renderContent() : this.renderLoading() }
			</Dialog>
		);
	},
} );

module.exports = ThanksModal;
