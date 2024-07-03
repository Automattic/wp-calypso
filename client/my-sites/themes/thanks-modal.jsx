import { Button, Dialog, Gridicon, ScreenReaderText } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PulsingDot from 'calypso/components/pulsing-dot';
import { addQueryArgs } from 'calypso/lib/route';
import getCustomizeOrEditFrontPageUrl from 'calypso/state/selectors/get-customize-or-edit-front-page-url';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import shouldCustomizeHomepageWithGutenberg from 'calypso/state/selectors/should-customize-homepage-with-gutenberg';
import { requestSite } from 'calypso/state/sites/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import { clearActivated } from 'calypso/state/themes/actions';
import {
	doesThemeBundleUsableSoftwareSet,
	getActiveTheme,
	getCanonicalTheme,
	getIsLivePreviewStarted,
	getThemeDetailsUrl,
	getThemeForumUrl,
	hasActivatedTheme,
	isActivatingTheme,
	isInstallingTheme,
	isWpcomTheme,
} from 'calypso/state/themes/selectors';
import { shouldRedirectToThankYouPage } from 'calypso/state/themes/selectors/should-redirect-to-thank-you-page';
import { themeHasAutoLoadingHomepage } from 'calypso/state/themes/selectors/theme-has-auto-loading-homepage';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { trackClick } from './helpers';
import { isFullSiteEditingTheme } from './is-full-site-editing-theme';

import './thanks-modal.scss';

class ThanksModal extends Component {
	static propTypes = {
		// Where is the modal being used?
		source: PropTypes.oneOf( [ 'details', 'list', 'upload' ] ).isRequired,
		// Connected props
		clearActivated: PropTypes.func.isRequired,
		requestSite: PropTypes.func.isRequired,
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
		isFSEActive: PropTypes.bool,
		themeId: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = {
			wasInstalling: false,
			isVisible: false,
		};
	}

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( nextProps.isLivePreviewStarted ) {
			return {
				isVisible: false,
				wasInstalling: false,
			};
		}
		if ( nextProps.shouldRedirectToThankYouPage ) {
			return {
				isVisible: false,
				wasInstalling: false,
			};
		}
		if ( nextProps.isInstalling || nextProps.isActivating || nextProps.hasActivated ) {
			return {
				isVisible: true,
				wasInstalling: nextProps.isInstalling,
			};
		} else if ( ! nextProps.isInstalling && prevState.wasInstalling ) {
			// There is a brief moment after installing a theme before we make the request to activate it,
			// so let's ensure the modal is still visible in the meantime.
			return {
				isVisible: true,
				wasInstalling: true,
			};
		}
		return {
			isVisible: false,
			wasInstalling: false,
		};
	}

	componentDidUpdate( prevProps ) {
		// When the theme has finished activating...
		if ( prevProps.hasActivated === false && this.props.hasActivated === true ) {
			// re-fetch the site to ensure we have the right cusotmizer link for FSE or not
			this.props.requestSite( this.props.siteId );

			// Redirect to plugin-bundle flow for themes including software (like woocommerce)
			const { siteSlug, doesThemeBundleUsableSoftware } = this.props;
			if ( doesThemeBundleUsableSoftware ) {
				const dest = `/setup/plugin-bundle?siteSlug=${ siteSlug }&comingFromThemeActivation=true`;
				window.location.replace( dest );
			}
		}
	}

	onCloseModal = () => {
		this.props.clearActivated( this.props.siteId );
	};

	trackClick = ( eventName, verb ) => {
		trackClick( 'current theme', eventName, verb );
	};

	trackVisitSite = () => {
		this.trackClick( 'visit site' );
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
	};

	goToCustomizer = () => {
		this.trackClick( 'thanks modal customize' );
		this.onCloseModal();
	};

	goToSiteEditor = () => {
		this.trackClick( 'thanks modal edit site' );
		this.onCloseModal();
	};

	renderThemeInfo = () => {
		return this.props.translate( '{{a}}Learn more about{{/a}} this theme.', {
			components: {
				a: <a href={ this.props.detailsUrl } onClick={ this.onLinkClick( 'theme info' ) } />,
			},
		} );
	};

	renderCustomizeInfo = () => {
		return this.props.translate( '{{a}}Customize{{/a}} this design.', {
			components: {
				a: <a href={ this.props.customizeUrl } onClick={ this.onLinkClick( 'customize' ) } />,
			},
		} );
	};

	renderSupportInfo = () => {
		const { author_uri: authorUri } = this.props.currentTheme;

		if ( this.props.forumUrl ) {
			return this.props.translate( 'Have questions? Stop by our {{a}}support forums{{/a}}.', {
				components: {
					a: <a href={ this.props.forumUrl } onClick={ this.onLinkClick( 'support' ) } />,
				},
			} );
		}

		if ( authorUri ) {
			return this.props.translate( 'Have questions? {{a}}Contact the theme author.{{/a}}', {
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
				<Button className="thanks-modal__button-close" onClick={ this.onCloseModal } borderless>
					<Gridicon icon="cross-small" />
					<ScreenReaderText>{ this.props.translate( 'Close' ) }</ScreenReaderText>
				</Button>
				<h1>
					{ this.props.translate( 'Thanks for choosing {{br/}} %(themeName)s', {
						args: { themeName },
						components: {
							br: <br />,
						},
					} ) }
				</h1>
				<span>
					{ this.props.translate( 'by %(themeAuthor)s', {
						args: { themeAuthor },
					} ) }
				</span>
				{ this.props.isFSEActive && (
					<p className="themes__thanks-modal-fse-notice">
						{ this.props.translate(
							'This theme uses the Site Editor, which lets you edit every aspect of your site with blocks, making it easier than ever to create exactly what you want.'
						) }
					</p>
				) }
			</div>
		);
	};

	renderLoading = () => {
		return (
			<div className="themes__thanks-modal-loading" data-testid="loadingThanksModalContent">
				<PulsingDot active />
			</div>
		);
	};

	getLoadingLabel = () => {
		return this.props.translate( 'Activating theme…' );
	};

	getEditSiteLabel = () => {
		const { shouldEditHomepageWithGutenberg, isFSEActive } = this.props;

		if ( isFSEActive ) {
			return (
				<span className="thanks-modal__button-customize">
					{ this.props.translate( 'Customize site' ) }
				</span>
			);
		}

		if ( shouldEditHomepageWithGutenberg ) {
			return (
				<span className="thanks-modal__button-customize">
					{ this.props.translate( 'Edit homepage' ) }
				</span>
			);
		}

		return (
			<span className="thanks-modal__button-customize">
				<Gridicon icon="external" />
				{ this.props.translate( 'Customize site' ) }
			</span>
		);
	};

	getViewSiteLabel = () => (
		<span className="thanks-modal__button-customize">
			<Gridicon icon="external" />
			{ this.props.translate( 'View site' ) }
		</span>
	);

	getButtons = ( shouldDisplayContent ) => {
		const { shouldEditHomepageWithGutenberg, isFSEActive } = this.props;

		const firstButton = shouldEditHomepageWithGutenberg
			? {
					action: 'view',
					label: this.getViewSiteLabel(),
					onClick: this.trackVisitSite,
					href: this.props.siteUrl,
					target: '_blank',
					disabled: false,
			  }
			: {
					action: 'learn',
					label: this.props.translate( 'Learn about this theme' ),
					onClick: this.learnThisTheme,
					href: this.props.detailsUrl,
					disabled: false,
			  };

		const primaryButton = {
			action: 'customizeSite',
			label: this.getEditSiteLabel(),
			isPrimary: true,
			disabled: false,
			onClick: isFSEActive ? this.goToSiteEditor : this.goToCustomizer,
			href: this.props.customizeUrl,
			target: shouldEditHomepageWithGutenberg || isFSEActive ? null : '_blank',
		};

		/**
		 * It does not make sense to show "Learn about this theme" or "View site" buttons
		 * in such a short loading moment.
		 */
		if ( ! shouldDisplayContent ) {
			return [
				{
					...primaryButton,
					label: this.getLoadingLabel(),
					disabled: true,
				},
			];
		}

		return [ firstButton, primaryButton ];
	};

	render() {
		const { currentTheme, hasActivated, doesThemeBundleUsableSoftware } = this.props;

		const shouldDisplayContent = hasActivated && currentTheme && ! doesThemeBundleUsableSoftware;

		return (
			<Dialog
				className="themes__thanks-modal"
				isVisible={ this.state.isVisible }
				buttons={ this.getButtons( shouldDisplayContent ) }
				onClose={ this.onCloseModal }
			>
				{ shouldDisplayContent ? this.renderContent() : this.renderLoading() }
			</Dialog>
		);
	}
}

const ConnectedThanksModal = connect(
	( state, props ) => {
		const siteId = getSelectedSiteId( state );
		const siteUrl = getSiteUrl( state, siteId );
		const currentThemeId = props.themeId ?? getActiveTheme( state, siteId );
		const currentTheme = currentThemeId && getCanonicalTheme( state, siteId, currentThemeId );
		const isFSEActive = isFullSiteEditingTheme( currentTheme );

		// Note: Gutenberg buttons will only show if the homepage is a page.
		const shouldEditHomepageWithGutenberg = shouldCustomizeHomepageWithGutenberg( state, siteId );

		const isAtomic = isSiteAtomic( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );
		const hasAutoLoadingHomepage = themeHasAutoLoadingHomepage( state, currentThemeId, siteId );

		// Atomic & Jetpack do not have auto-loading-homepage behavior, so we trigger the layout picker for them.
		const customizeUrl =
			( isAtomic || isJetpack ) && hasAutoLoadingHomepage
				? addQueryArgs(
						{ 'new-homepage': true },
						getCustomizeOrEditFrontPageUrl( state, currentThemeId, siteId, isFSEActive )
				  )
				: getCustomizeOrEditFrontPageUrl( state, currentThemeId, siteId, isFSEActive );

		const activatingThemeId = state.themes.activationRequests?.themeId;

		const isLivePreviewStarted = getIsLivePreviewStarted( state );

		return {
			siteId,
			siteUrl,
			siteSlug: getSiteSlug( state, siteId ),
			currentTheme,
			doesThemeBundleUsableSoftware: doesThemeBundleUsableSoftwareSet(
				state,
				currentThemeId,
				siteId
			),
			shouldEditHomepageWithGutenberg,
			shouldRedirectToThankYouPage: shouldRedirectToThankYouPage( state, activatingThemeId ),
			detailsUrl: getThemeDetailsUrl( state, currentThemeId, siteId ),
			customizeUrl,
			forumUrl: getThemeForumUrl( state, currentThemeId, siteId ),
			hasActivated: !! hasActivatedTheme( state, siteId ),
			isActivating: !! isActivatingTheme( state, siteId ),
			isFSEActive,
			isInstalling: isInstallingTheme( state, currentThemeId, siteId ),
			isLivePreviewStarted,
			isThemeWpcom: isWpcomTheme( state, currentThemeId ),
		};
	},
	{
		clearActivated,
		requestSite,
	}
)( localize( ThanksModal ) );

export default ConnectedThanksModal;
