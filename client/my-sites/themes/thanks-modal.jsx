/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import page from 'page';
import { translate } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import PulsingDot from 'components/pulsing-dot';
import { trackClick } from './helpers';
import {
	getActiveTheme,
	getCanonicalTheme,
	getThemeDetailsUrl,
	getThemeForumUrl,
	isActivatingTheme,
	hasActivatedTheme,
	isWpcomTheme,
} from 'state/themes/selectors';
import { clearActivated } from 'state/themes/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestSite } from 'state/sites/actions';
import getCustomizeOrEditFrontPageUrl from 'state/selectors/get-customize-or-edit-front-page-url';
import shouldCustomizeHomepageWithGutenberg from 'state/selectors/should-customize-homepage-with-gutenberg';
import getSiteUrl from 'state/selectors/get-site-url';

/**
 * Style dependencies
 */
import './thanks-modal.scss';

class ThanksModal extends Component {
	static propTypes = {
		// Where is the modal being used?
		source: PropTypes.oneOf( [ 'details', 'list', 'upload' ] ).isRequired,
		// Connected props
		clearActivated: PropTypes.func.isRequired,
		refreshSite: PropTypes.func.isRequired,
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
	};

	componentDidUpdate( prevProps ) {
		// re-fetch the site to ensure we have the right cusotmizer link for FSE or not
		if ( prevProps.hasActivated === false && this.props.hasActivated === true ) {
			this.props.refreshSite( this.props.siteId );
		}
	}

	onCloseModal = () => {
		this.props.clearActivated( this.props.siteId );
		this.setState( { show: false } );
	};

	trackClick = ( eventName, verb ) => {
		trackClick( 'current theme', eventName, verb );
	};

	visitSite = () => {
		this.trackClick( 'visit site' );
		window.open( this.props.siteUrl, '_blank' );
	};

	goBack = () => {
		this.trackClick( 'go back' );
		this.onCloseModal();
	};

	onLinkClick = ( link ) => {
		return () => {
			this.onCloseModal();
			this.trackClick( link, 'click' );
		};
	};

	renderBody = () => {
		return (
			<ul>
				<li>
					{ this.props.source === 'list' ? this.renderThemeInfo() : this.renderCustomizeInfo() }
				</li>
				<li>{ this.renderSupportInfo() }</li>
			</ul>
		);
	};

	learnThisTheme = () => {
		this.trackClick( 'learn this theme' );
		this.onCloseModal();
		page( this.props.detailsUrl );
	};

	goToCustomizer = () => {
		const { customizeUrl, shouldEditHomepageWithGutenberg } = this.props;

		this.trackClick( 'thanks modal customize' );
		this.onCloseModal();

		shouldEditHomepageWithGutenberg ? page( customizeUrl ) : window.open( customizeUrl, '_blank' );
	};

	renderThemeInfo = () => {
		return translate( '{{a}}Learn more about{{/a}} this theme.', {
			components: {
				a: <a href={ this.props.detailsUrl } onClick={ this.onLinkClick( 'theme info' ) } />,
			},
		} );
	};

	renderCustomizeInfo = () => {
		return translate( '{{a}}Customize{{/a}} this design.', {
			components: {
				a: <a href={ this.props.customizeUrl } onClick={ this.onLinkClick( 'customize' ) } />,
			},
		} );
	};

	renderSupportInfo = () => {
		const { author_uri: authorUri } = this.props.currentTheme;

		if ( this.props.forumUrl ) {
			return translate( 'Have questions? Stop by our {{a}}support forums{{/a}}.', {
				components: {
					a: <a href={ this.props.forumUrl } onClick={ this.onLinkClick( 'support' ) } />,
				},
			} );
		}

		if ( authorUri ) {
			return translate( 'Have questions? {{a}}Contact the theme author.{{/a}}', {
				components: {
					a: <a href={ authorUri } onClick={ this.onLinkClick( 'org author' ) } />,
				},
			} );
		}

		return null;
	};

	renderContent = () => {
		const { name: themeName, author: themeAuthor } = this.props.currentTheme;

		return (
			<div>
				<h1>
					{ translate( 'Thanks for choosing {{br/}} %(themeName)s', {
						args: { themeName },
						components: {
							br: <br />,
						},
					} ) }
				</h1>
				<span>
					{ translate( 'by %(themeAuthor)s', {
						args: { themeAuthor },
					} ) }
				</span>
			</div>
		);
	};

	renderLoading = () => {
		return (
			<div className="themes__thanks-modal-loading">
				<PulsingDot active={ true } />
			</div>
		);
	};

	getEditSiteLabel = () => {
		const { shouldEditHomepageWithGutenberg, hasActivated } = this.props;
		if ( ! hasActivated ) {
			return translate( 'Activating theme…' );
		}

		const gutenbergContent = translate( 'Edit Homepage' );
		const customizerContent = (
			<>
				<Gridicon icon="external" />
				{ translate( 'Customize site' ) }
			</>
		);

		return (
			<span className="thanks-modal__button-customize">
				{ shouldEditHomepageWithGutenberg ? gutenbergContent : customizerContent }
			</span>
		);
	};

	getViewSiteLabel = () => (
		<span className="thanks-modal__button-customize">
			<Gridicon icon="external" />
			{ translate( 'View Site' ) }
		</span>
	);

	getButtons = () => {
		const { shouldEditHomepageWithGutenberg, hasActivated } = this.props;

		const firstButton = shouldEditHomepageWithGutenberg
			? {
					action: 'view',
					label: this.getViewSiteLabel(),
					onClick: this.visitSite,
			  }
			: {
					action: 'learn',
					label: translate( 'Learn about this theme' ),
					onClick: this.learnThisTheme,
			  };

		return [
			{
				...firstButton,
				disabled: ! hasActivated,
			},
			{
				action: 'customizeSite',
				label: this.getEditSiteLabel(),
				isPrimary: true,
				disabled: ! hasActivated,
				onClick: this.goToCustomizer,
			},
		];
	};

	render() {
		const { currentTheme, hasActivated, isActivating } = this.props;

		return (
			<Dialog
				className="themes__thanks-modal"
				isVisible={ isActivating || hasActivated }
				buttons={ this.getButtons() }
				onClose={ this.onCloseModal }
			>
				{ hasActivated && currentTheme ? this.renderContent() : this.renderLoading() }
			</Dialog>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteUrl = getSiteUrl( state, siteId );
		const currentThemeId = getActiveTheme( state, siteId );
		const currentTheme = currentThemeId && getCanonicalTheme( state, siteId, currentThemeId );

		// Note: Gutenberg buttons will only show if the homepage is a page.
		const shouldEditHomepageWithGutenberg = shouldCustomizeHomepageWithGutenberg( state, siteId );

		return {
			siteId,
			siteUrl,
			currentTheme,
			shouldEditHomepageWithGutenberg,
			detailsUrl: getThemeDetailsUrl( state, currentThemeId, siteId ),
			customizeUrl: getCustomizeOrEditFrontPageUrl( state, currentThemeId, siteId ),
			forumUrl: getThemeForumUrl( state, currentThemeId, siteId ),
			isActivating: !! isActivatingTheme( state, siteId ),
			hasActivated: !! hasActivatedTheme( state, siteId ),
			isThemeWpcom: isWpcomTheme( state, currentThemeId ),
		};
	},
	( dispatch ) => {
		return {
			clearActivated: ( siteId ) => dispatch( clearActivated( siteId ) ),
			refreshSite: ( siteId ) => dispatch( requestSite( siteId ) ),
		};
	}
)( ThanksModal );
