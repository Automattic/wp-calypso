/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import PulsingDot from 'components/pulsing-dot';
import { getDetailsUrl, getCustomizeUrl, getForumUrl, trackClick } from './helpers';
import {
	isActivating,
	hasActivated,
	getCurrentTheme
} from 'state/themes/current-theme/selectors';
import { clearActivated } from 'state/themes/actions';

const ThanksModal = React.createClass( {
	trackClick: trackClick.bind( null, 'current theme' ),

	propTypes: {
		// Where is the modal being used?
		source: React.PropTypes.oneOf( [ 'details', 'list' ] ).isRequired,
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
		this.props.clearActivated();
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
		const features = this.translate( "Discover this theme's {{a}}awesome features.{{/a}}", {
			components: {
				a: <a href={ getDetailsUrl( this.props.currentTheme, this.props.site ) }
					onClick={ this.onLinkClick( 'features' ) }/>
			}
		} );
		const customize = this.translate( '{{a}}Customize{{/a}} this design.', {
			components: {
				a: <a href={ getCustomizeUrl( this.props.currentTheme, this.props.site ) }
					onClick={ this.onLinkClick( 'customize' ) }/>
			}
		} );
		return (
			<ul>
				<li>
					{ this.props.source === 'list' ? features : customize }
				</li>
			<li>
				{ this.translate( 'Have questions? Stop by our {{a}}support forums.{{/a}}', {
					components: {
						a: <a href={ getForumUrl( this.props.currentTheme ) }
							onClick={ this.onLinkClick( 'support' ) }/>
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
					{ this.translate( 'Learn more about this {{a}}awesome theme{{/a}}.', {
						components: {
							a: <a href={ themeUri }
								onClick={ this.onLinkClick( 'org theme' ) }/>
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
					{ this.translate( 'Have questions? {{a}}Contact the theme author.{{/a}}', {
						components: {
							a: <a href={ authorUri }
								onClick={ this.onLinkClick( 'org author' ) }/>
						}
					} ) }
				</li>
			);
		}
	},

	renderWporgForumInfo() {
		return (
			<li>
				{ this.translate( 'If you need support, visit the WordPress.org {{a}}Themes forum{{/a}}.', {
					components: {
						a: <a href="https://wordpress.org/support/forum/themes-and-templates"
							onClick={ this.onLinkClick( 'org forum' ) }/>
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
					{ this.translate( 'Thanks for choosing {{br/}} %(themeName)s {{br/}} by %(themeAuthor)s', {
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
		const buttons = [
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

export default connect(
	( state, props ) => ( {
		isActivating: isActivating( state ),
		hasActivated: hasActivated( state ),
		currentTheme: getCurrentTheme( state, props.site ? props.site.ID : null )
	} ),
	{ clearActivated }
)( ThanksModal );
