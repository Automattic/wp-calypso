/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import page from 'page';
import { translate } from 'i18n-calypso';
import { get } from 'lodash';

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
	hasActivatedTheme,
	isWpcomTheme
} from 'state/themes/selectors';
import { clearActivated } from 'state/themes/actions';
import { getSite, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const ThanksModal = React.createClass( {
	trackClick: trackClick.bind( null, 'current theme' ),

	propTypes: {
		// Where is the modal being used?
		source: PropTypes.oneOf( [ 'details', 'list', 'upload' ] ).isRequired,
		// Connected props
		clearActivated: PropTypes.func.isRequired,
		currentTheme: PropTypes.shape( {
			author: PropTypes.string,
			author_uri: PropTypes.string,
			id: PropTypes.string,
			name: PropTypes.string,
		} ),
		customizeUrl: PropTypes.string,
		detailsUrl: PropTypes.string,
		forumUrl: PropTypes.string,
		hasActivated: PropTypes.bool.isRequired,
		isActivating: PropTypes.bool.isRequired,
		isThemeWpcom: PropTypes.bool.isRequired,
		siteId: PropTypes.number,
		visitSiteUrl: PropTypes.string
	},

	onCloseModal() {
		this.props.clearActivated( this.props.siteId );
		this.setState( { show: false } );
	},

	visitSite() {
		this.trackClick( 'visit site' );
		page( this.props.visitSiteUrl );
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

	renderBody() {
		return (
			<ul>
				<li>
					{ this.props.source === 'list' ? this.renderThemeInfo() : this.renderCustomizeInfo() }
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
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteUrl = get( getSite( state, siteId ), 'URL' );
		const currentThemeId = getActiveTheme( state, siteId );
		const currentTheme = currentThemeId && getCanonicalTheme( state, siteId, currentThemeId );

		return {
			siteId,
			currentTheme,
			detailsUrl: getThemeDetailsUrl( state, currentThemeId, siteId ),
			customizeUrl: getThemeCustomizeUrl( state, currentThemeId, siteId ),
			forumUrl: getThemeForumUrl( state, currentThemeId, siteId ),
			visitSiteUrl: siteUrl + ( isJetpackSite( state, siteId ) ? '' : '?next=customize' ),
			isActivating: !! ( isActivatingTheme( state, siteId ) ),
			hasActivated: !! ( hasActivatedTheme( state, siteId ) ),
			isThemeWpcom: isWpcomTheme( state, currentThemeId )
		};
	},
	{ clearActivated }
)( ThanksModal );
