/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import PulsingDot from 'components/pulsing-dot';
import { trackClick } from './helpers';
import { isJetpackSite } from 'state/sites/selectors';
import {
	getActiveTheme,
	getTheme,
	getThemeDetailsUrl,
	getThemeCustomizeUrl,
	getThemeForumUrl,
	isActivatingTheme,
	hasActivatedTheme
} from 'state/themes/selectors';
import { clearActivated } from 'state/themes/actions';

const ThanksModal = React.createClass( {
	trackClick: trackClick.bind( null, 'current theme' ),

	propTypes: {
		// Where is the modal being used?
		source: React.PropTypes.oneOf( [ 'details', 'list', 'upload' ] ).isRequired,
		// Connected props
		isActivating: React.PropTypes.bool.isRequired,
		hasActivated: React.PropTypes.bool.isRequired,
		currentTheme: React.PropTypes.shape( {
			name: React.PropTypes.string,
			id: React.PropTypes.string
		} ),
		clearActivated: React.PropTypes.func.isRequired,
	},

	onCloseModal() {
		this.props.clearActivated( this.props.site.ID );
		this.setState( { show: false } );
	},

	visitSite() {
		this.trackClick( 'visit site' );
		page( this.props.site.URL );
	},

	goBack() {
		this.trackClick( 'go back' );
		this.onCloseModal();
	},

	onLinkClick( link ) {
		return () => {
			this.onCloseModal();
			this.trackClick( link, 'click' );
		};
	},

	renderWpcomInfo() {
		const features = translate( "Discover this theme's {{a}}awesome features.{{/a}}", {
			components: {
				a: <a href={ this.props.detailsUrl }
					onClick={ this.onLinkClick( 'features' ) } />
			}
		} );
		const customize = translate( '{{a}}Customize{{/a}} this design.', {
			components: {
				a: <a href={ this.props.customizeUrl }
					onClick={ this.onLinkClick( 'customize' ) } />
			}
		} );
		return (
			<ul>
				<li>
					{ this.props.source === 'list' ? features : customize }
				</li>
			<li>
				{ translate( 'Have questions? Stop by our {{a}}support forums.{{/a}}', {
					components: {
						a: <a href={ this.props.forumUrl }
							onClick={ this.onLinkClick( 'support' ) } />
					}
				} ) }
			</li>
			</ul>
		);
	},

	renderWporgThemeInfo( themeUri ) {
		if ( themeUri ) {
			return (
				<li>
					{ translate( 'Learn more about this {{a}}awesome theme{{/a}}.', {
						components: {
							a: <a href={ themeUri }
								onClick={ this.onLinkClick( 'org theme' ) } />
						}
					} ) }
				</li>
			);
		}
	},

	renderWporgAuthorInfo( authorUri ) {
		if ( authorUri ) {
			return (
				<li>
					{ translate( 'Have questions? {{a}}Contact the theme author.{{/a}}', {
						components: {
							a: <a href={ authorUri }
								onClick={ this.onLinkClick( 'org author' ) } />
						}
					} ) }
				</li>
			);
		}
	},

	renderWporgForumInfo() {
		return (
			<li>
				{ translate( 'If you need support, visit the WordPress.org {{a}}Themes forum{{/a}}.', {
					components: {
						a: <a href="https://wordpress.org/support/forum/themes-and-templates"
							onClick={ this.onLinkClick( 'org forum' ) } />
					}
				} ) }
			</li>
		);
	},

	renderJetpackInfo() {
		const {
			theme_uri: themeUri,
			author_uri: authorUri
		} = this.props.currentTheme;

		return (
			<ul>
				{ themeUri ? this.renderWporgThemeInfo( themeUri ) : null }
				{ authorUri ? this.renderWporgAuthorInfo( authorUri ) : null }
				{ ! themeUri || ! authorUri ? this.renderWporgForumInfo() : null }
			</ul>
		);
	},

	renderContent() {
		const {
			name: themeName,
			author: themeAuthor
		} = this.props.currentTheme;

		return (
			<div>
				<h1>
					{ translate( 'Thanks for choosing {{br/}} %(themeName)s {{br/}} by %(themeAuthor)s', {
						args: { themeName, themeAuthor },
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

	renderLoading() {
		return (
			<div>
				<PulsingDot active={ true } />
			</div>
		);
	},

	render() {
		const { currentTheme, hasActivated, isActivating } = this.props;
		const visitSiteText = hasActivated ? translate( 'Visit site' ) : translate( 'Activating theme…' );
		const buttons = [
			{ action: 'back', label: translate( 'Back to themes' ), onClick: this.goBack },
			{ action: 'visitSite', label: visitSiteText, isPrimary: true, disabled: ! hasActivated, onClick: this.visitSite },
		];

		return (
			<Dialog className="themes-thanks-modal"
				isVisible={ isActivating || hasActivated }
				buttons={ buttons }
				onClose={ this.onCloseModal } >
				{ hasActivated && currentTheme ? this.renderContent() : this.renderLoading() }
			</Dialog>
		);
	},
} );

export default connect(
	( state, { site } ) => {
		const siteIdOrWpcom = ( site && isJetpackSite( state, site.ID ) ) ? site.ID : 'wpcom';
		const currentThemeId = site && getActiveTheme( state, site.ID );
		const currentTheme = currentThemeId && getTheme( state, siteIdOrWpcom, currentThemeId );

		return {
			currentTheme,
			detailsUrl: site && getThemeDetailsUrl( state, currentTheme, site.ID ),
			customizeUrl: site && getThemeCustomizeUrl( state, currentTheme, site.ID ),
			forumUrl: getThemeForumUrl( state, currentThemeId ),
			isActivating: !! ( site && isActivatingTheme( state, site.ID ) ),
			hasActivated: !! ( site && hasActivatedTheme( state, site.ID ) )
		};
	},
	{ clearActivated }
)( ThanksModal );
