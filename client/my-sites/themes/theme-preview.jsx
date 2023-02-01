import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { getDesignPreviewUrl } from '@automattic/design-picker';
import { createHigherOrderComponent } from '@wordpress/compose';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import PulsingDot from 'calypso/components/pulsing-dot';
import ThemePreviewModal from 'calypso/components/theme-preview-modal';
import WebPreview from 'calypso/components/web-preview';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { hideThemePreview, setThemePreviewOptions } from 'calypso/state/themes/actions';
import {
	getCanonicalTheme,
	getThemeDemoUrl,
	getThemeFilterToTermTable,
	getThemePreviewThemeOptions,
	themePreviewVisibility,
	isThemeActive,
	isInstallingTheme,
	isActivatingTheme,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSubjectsFromTermTable, localizeThemesPath } from './helpers';
import { connectOptions } from './theme-options';

const isDefaultVariationSlug = ( slug ) => ! slug || slug === 'default';

class ThemePreview extends Component {
	static displayName = 'ThemePreview';

	static propTypes = {
		// connected props
		belowToolbar: PropTypes.element,
		demoUrl: PropTypes.string,
		isActivating: PropTypes.bool,
		isActive: PropTypes.bool,
		isInstalling: PropTypes.bool,
		isJetpack: PropTypes.bool,
		themeId: PropTypes.string,
		themeOptions: PropTypes.object,
	};

	state = {
		showActionIndicator: false,
		showUnlockStyleUpgradeModal: false,
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.isActivating && ! nextProps.isActivating ) {
			this.setState( { showActionIndicator: false } );
			this.props.hideThemePreview();
		}
		if ( ! this.props.isInstalling && nextProps.isInstalling ) {
			this.setState( { showActionIndicator: true } );
		}
	}

	getPrimaryOption = () => {
		return this.props.themeOptions.primary;
	};

	getSecondaryOption = () => {
		const { isActive } = this.props;
		return isActive ? null : this.props.themeOptions.secondary;
	};

	getStyleVariationOption = () => {
		return this.props.themeOptions?.styleVariation;
	};

	shouldShowUnlockStyleButton = () => {
		const { options, shouldLimitGlobalStyles, themeOptions } = this.props;
		if ( ! themeOptions ) {
			return false;
		}

		const primaryOption = this.getPrimaryOption();
		const styleVariationOption = this.getStyleVariationOption();
		return (
			shouldLimitGlobalStyles &&
			primaryOption?.key === options.activate.key &&
			! isDefaultVariationSlug( styleVariationOption?.slug )
		);
	};

	onPrimaryButtonClick = () => {
		const { themeId } = this.props;
		const option = this.getPrimaryOption();

		this.props.recordTracksEvent( 'calypso_theme_preview_primary_button_click', {
			theme: themeId,
			...( option.key && { action: option.key } ),
		} );

		option.action && option.action( themeId );
		! this.props.isJetpack && this.props.hideThemePreview();
	};

	onSecondaryButtonClick = () => {
		const { themeId } = this.props;
		const secondary = this.getSecondaryOption();

		this.props.recordTracksEvent( 'calypso_theme_preview_secondary_button_click', {
			theme: themeId,
			...( secondary.key && { action: secondary.key } ),
		} );

		secondary.action && secondary.action( themeId );
		! this.props.isJetpack && this.props.hideThemePreview();
	};

	onUnlockStyleButtonClick = () => {
		this.setState( { showUnlockStyleUpgradeModal: true } );
	};

	onPremiumGlobalStylesUpgradeModalCheckout = () => {
		this.setState( { showUnlockStyleUpgradeModal: false } );
		page( `/checkout/${ this.props.siteSlug || '' }/premium` );
	};

	onPremiumGlobalStylesUpgradeModalTryStyle = () => {
		this.setState( { showUnlockStyleUpgradeModal: false } );
		this.onPrimaryButtonClick();
	};

	onPremiumGlobalStylesUpgradeModalClose = () => {
		this.setState( { showUnlockStyleUpgradeModal: false } );
	};

	appendStyleVariationOptionToUrl = ( url ) => {
		const styleVariationOption = this.getStyleVariationOption();
		if ( ! styleVariationOption ) {
			return url;
		}

		const [ base, query ] = url.split( '?' );
		const params = new URLSearchParams( query );
		params.set( 'style_variation', styleVariationOption.slug );
		return `${ base }?${ params.toString() }`;
	};

	renderPrimaryButton = () => {
		const primaryOption = this.getPrimaryOption();
		let buttonHref = primaryOption.getUrl ? primaryOption.getUrl( this.props.themeId ) : null;
		if ( buttonHref ) {
			buttonHref = this.appendStyleVariationOptionToUrl( buttonHref );
		}

		return (
			<Button primary onClick={ this.onPrimaryButtonClick } href={ buttonHref }>
				{ primaryOption.label }
			</Button>
		);
	};

	renderSecondaryButton = () => {
		const secondaryButton = this.getSecondaryOption();
		if ( ! secondaryButton ) {
			return;
		}

		let buttonHref = secondaryButton.getUrl ? secondaryButton.getUrl( this.props.themeId ) : null;
		if ( buttonHref ) {
			buttonHref = this.appendStyleVariationOptionToUrl( buttonHref );
		}

		return (
			<Button onClick={ this.onSecondaryButtonClick } href={ buttonHref }>
				{ secondaryButton.label }
			</Button>
		);
	};

	renderUnlockStyleButton = () => {
		return (
			<Button primary onClick={ this.onUnlockStyleButtonClick }>
				{ this.props.translate( 'Unlock this style' ) }
			</Button>
		);
	};

	getPreviewUrl = () => {
		const { demoUrl, locale, theme } = this.props;
		if ( isEnabled( 'themes/showcase-i4/details-and-preview' ) && theme.stylesheet ) {
			return getDesignPreviewUrl( { slug: theme.id, recipe: theme }, { language: locale } );
		}

		return demoUrl + '?demo=true&iframe=true&theme_preview=true';
	};

	onSelectVariation = ( variation ) => {
		const { themeId, primary, secondary } = this.props.themeOptions;
		this.props.recordTracksEvent( 'calypso_theme_preview_style_variation_click', {
			theme: themeId,
			style_variation: variation.slug,
		} );

		this.props.setThemePreviewOptions( themeId, primary, secondary, variation );
	};

	onClickCategory = ( category ) => {
		const { filterToTermTable, isLoggedIn, locale, siteSlug, themeId } = this.props;
		const subjectTermTable = getSubjectsFromTermTable( filterToTermTable );
		const subject = subjectTermTable[ `subject:${ category.slug }` ];

		if ( subject ) {
			this.props.recordTracksEvent( 'calypso_theme_preview_category_click', {
				theme: themeId,
				category: category.slug,
			} );

			const path = `/themes/filter/${ subject }/${ siteSlug ?? '' }`;
			window.location.href = localizeThemesPath( path, locale, ! isLoggedIn );
		}
	};

	onClickDevice = ( device ) => {
		this.props.recordTracksEvent( 'calypso_theme_preview_device_switcher_click', {
			theme: this.props.themeId,
			device,
		} );
	};

	onClose = () => {
		this.props.recordTracksEvent( 'calypso_theme_preview_close_click', {
			theme: this.props.themeId,
		} );
		this.props.hideThemePreview();
	};

	render() {
		const { theme, themeId, siteId, demoUrl, children, isWPForTeamsSite, shouldLimitGlobalStyles } =
			this.props;
		const { showActionIndicator, showUnlockStyleUpgradeModal } = this.state;
		const selectedVariation = this.getStyleVariationOption();
		const showUnlockStyleButton = this.shouldShowUnlockStyleButton();
		const isNewDetailsAndPreview = isEnabled( 'themes/showcase-i4/details-and-preview' );

		if ( ! themeId || isWPForTeamsSite ) {
			return null;
		}

		return (
			<div>
				<QueryCanonicalTheme siteId={ siteId } themeId={ themeId } />
				{ children }
				{ demoUrl &&
					( isNewDetailsAndPreview ? (
						<ThemePreviewModal
							theme={ theme }
							previewUrl={ this.getPreviewUrl() }
							selectedVariation={ selectedVariation }
							actionButtons={
								<>
									{ showUnlockStyleButton
										? this.renderUnlockStyleButton()
										: this.renderPrimaryButton() }
									{ this.renderSecondaryButton() }
								</>
							}
							shouldLimitGlobalStyles={ shouldLimitGlobalStyles }
							onSelectVariation={ this.onSelectVariation }
							onClickCategory={ this.onClickCategory }
							onClose={ this.onClose }
							recordDeviceClick={ this.onClickDevice }
						/>
					) : (
						<WebPreview
							showPreview={ true }
							showExternal={ false }
							showSEO={ false }
							onClose={ this.props.hideThemePreview }
							previewUrl={ this.getPreviewUrl() }
							externalUrl={ this.props.demoUrl }
							belowToolbar={ this.props.belowToolbar }
						>
							{ showActionIndicator && <PulsingDot active={ true } /> }
							{ ! showActionIndicator && this.renderSecondaryButton() }
							{ ! showActionIndicator && this.renderPrimaryButton() }
						</WebPreview>
					) ) }
				<PremiumGlobalStylesUpgradeModal
					checkout={ this.onPremiumGlobalStylesUpgradeModalCheckout }
					tryStyle={ this.onPremiumGlobalStylesUpgradeModalTryStyle }
					closeModal={ this.onPremiumGlobalStylesUpgradeModalClose }
					isOpen={ showUnlockStyleUpgradeModal }
				/>
			</div>
		);
	}
}

const withSiteGlobalStylesStatus = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { siteId } = props;
		const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId || -1 );
		return <Wrapped { ...props } shouldLimitGlobalStyles={ shouldLimitGlobalStyles } />;
	},
	'withSiteGlobalStylesStatus'
);

// make all actions available to preview.
const ConnectedThemePreview = connectOptions( ThemePreview );

export default connect(
	( state ) => {
		const themeId = themePreviewVisibility( state );
		if ( ! themeId ) {
			return { themeId };
		}

		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		const themeOptions = getThemePreviewThemeOptions( state );
		return {
			theme: getCanonicalTheme( state, siteId, themeId ),
			themeId,
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
			isJetpack,
			themeOptions,
			filterToTermTable: getThemeFilterToTermTable( state ),
			isInstalling: isInstallingTheme( state, themeId, siteId ),
			isActive: isThemeActive( state, themeId, siteId ),
			isActivating: isActivatingTheme( state, siteId ),
			demoUrl: getThemeDemoUrl( state, themeId, siteId ),
			isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
			isLoggedIn: isUserLoggedIn( state ),
			options: [
				'activate',
				'preview',
				'purchase',
				'upgradePlan',
				'tryandcustomize',
				'customize',
				'separator',
				'info',
				'signup',
				'support',
				'help',
			],
		};
	},
	{ hideThemePreview, recordTracksEvent, setThemePreviewOptions }
)( withSiteGlobalStylesStatus( localize( ConnectedThemePreview ) ) );
