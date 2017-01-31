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
import {
	getActiveTheme,
	getCanonicalTheme,
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
		const features = this.renderThemeInfo();
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

	renderThemeInfo() {
		return (
			translate( '{{a}}Learn more about{{/a}} this theme.', {
				components: {
					a: <a href={ this.props.detailsUrl }
						onClick={ this.onLinkClick( 'theme info' ) } />
				}
			} )
		);
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

	renderJetpackInfo() {
		const {
			author_uri: authorUri
		} = this.props.currentTheme;

		return (
			<ul>
				<li>{ this.renderThemeInfo() }</li>
				{ authorUri ? this.renderWporgAuthorInfo( authorUri ) : null }
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
		const currentThemeId = site && getActiveTheme( state, site.ID );
		const currentTheme = currentThemeId && getCanonicalTheme( state, site.ID, currentThemeId );

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
