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
	getThemeSetupUrl,
	isActivatingTheme,
	hasActivatedTheme,
	isWpcomTheme
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
		const themeSetup = this.props.site.jetpack ? null : translate( 'Make your site look like the demo with {{a}}Theme Setup{{/a}}.', {
			components: {
				a: <a href={ this.props.themeSetupUrl }
					onClick={ this.onLinkClick( 'setup' ) } />
			}
		} );
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
				{ themeSetup }
				<li>
					{ this.props.source === 'list' ? features : customize }
				</li>
			<li>
				{ this.renderSupportInfo() }
			</li>
			</ul>
		);
	},

	renderThemeInfo() {
		return translate( '{{a}}Learn more about{{/a}} this theme.', {
			components: {
				a: <a href={ this.props.detailsUrl }
					onClick={ this.onLinkClick( 'theme info' ) } />
			}
		} );
	},

	renderCustomizeInfo() {
		return translate( '{{a}}Customize{{/a}} this design.', {
			components: {
				a: <a href={ this.props.customizeUrl }
					onClick={ this.onLinkClick( 'customize' ) } />
			}
		} );
	},

	renderSupportInfo() {
		const { author_uri: authorUri } = this.props.currentTheme;

		if ( this.props.forumUrl ) {
			return translate( 'Have questions? Stop by our {{a}}support forums{{/a}}.', {
				components: {
					a: <a href={ this.props.forumUrl }
						onClick={ this.onLinkClick( 'support' ) } />
				}
			} );
		}

		if ( authorUri ) {
			return translate( 'Have questions? {{a}}Contact the theme author.{{/a}}', {
				components: {
					a: <a href={ authorUri }
						onClick={ this.onLinkClick( 'org author' ) } />
				}
			} );
		}

		return null;
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
				{ this.renderBody() }
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
			themeSetupUrl: site && getThemeSetupUrl( state, site.ID ),
			detailsUrl: site && getThemeDetailsUrl( state, currentTheme, site.ID ),
			customizeUrl: site && getThemeCustomizeUrl( state, currentTheme, site.ID ),
			forumUrl: site && getThemeForumUrl( state, currentThemeId, site.ID ),
			isActivating: !! ( site && isActivatingTheme( state, site.ID ) ),
			hasActivated: !! ( site && hasActivatedTheme( state, site.ID ) ),
			isThemeWpcom: isWpcomTheme( state, currentThemeId )
		};
	},
	{ clearActivated }
)( ThanksModal );
