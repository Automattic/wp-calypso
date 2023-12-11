import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import PulsingDot from 'calypso/components/pulsing-dot';
import WebPreview from 'calypso/components/web-preview';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { hideThemePreview } from 'calypso/state/themes/actions';
import {
	getThemeDemoUrl,
	getThemePreviewThemeOptions,
	themePreviewVisibility,
	isThemeActive,
	isInstallingTheme,
	isActivatingTheme,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { connectOptions } from './theme-options';

const DEFAULT_VARIATION_SLUG = 'default';
const isDefaultVariationSlug = ( slug ) => ! slug || slug === DEFAULT_VARIATION_SLUG;

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

	getPremiumGlobalStylesEventProps = () => {
		const { themeId } = this.props;
		const styleVariationOption = this.getStyleVariationOption();
		return {
			theme: themeId,
			style_variation: styleVariationOption?.slug,
		};
	};

	appendStyleVariationOptionToUrl = ( url, key = 'slug' ) => {
		const styleVariationOption = this.getStyleVariationOption();
		if ( ! styleVariationOption ) {
			return url;
		}

		const [ base, query ] = url.split( '?' );
		const params = new URLSearchParams( query );
		params.set( 'style_variation', styleVariationOption[ key ] );

		return `${ base }?${ params.toString() }`;
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
		this.props.recordTracksEvent(
			'calypso_theme_preview_global_styles_gating_modal_show',
			this.getPremiumGlobalStylesEventProps()
		);

		this.setState( { showUnlockStyleUpgradeModal: true } );
	};

	onPremiumGlobalStylesUpgradeModalCheckout = () => {
		this.props.recordTracksEvent(
			'calypso_theme_preview_global_styles_gating_modal_checkout_button_click',
			this.getPremiumGlobalStylesEventProps()
		);

		const params = new URLSearchParams();
		params.append( 'redirect_to', window.location.href.replace( window.location.origin, '' ) );

		this.setState( { showUnlockStyleUpgradeModal: false } );
		page( `/checkout/${ this.props.siteSlug || '' }/premium?${ params.toString() }` );
	};

	onPremiumGlobalStylesUpgradeModalTryStyle = () => {
		this.props.recordTracksEvent(
			'calypso_theme_preview_global_styles_gating_modal_try_button_click',
			this.getPremiumGlobalStylesEventProps()
		);

		this.setState( { showUnlockStyleUpgradeModal: false } );
		this.onPrimaryButtonClick();
	};

	onPremiumGlobalStylesUpgradeModalClose = () => {
		this.props.recordTracksEvent(
			'calypso_theme_preview_global_styles_gating_modal_close_button_click',
			this.getPremiumGlobalStylesEventProps()
		);

		this.setState( { showUnlockStyleUpgradeModal: false } );
	};

	renderPrimaryButton = () => {
		const primaryOption = this.getPrimaryOption();
		if ( ! primaryOption ) {
			return;
		}

		const { themeId } = this.props;
		const buttonHref = primaryOption.getUrl
			? this.appendStyleVariationOptionToUrl( primaryOption.getUrl( themeId ) )
			: null;

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

		const { themeId } = this.props;
		const buttonHref = secondaryButton.getUrl
			? this.appendStyleVariationOptionToUrl( secondaryButton.getUrl( themeId ) )
			: null;

		return (
			<Button onClick={ this.onSecondaryButtonClick } href={ buttonHref }>
				{ secondaryButton.label }
			</Button>
		);
	};

	renderUnlockStyleButton = () => {
		const primaryOption = this.getPrimaryOption();
		if ( ! primaryOption ) {
			return;
		}

		return (
			<Button primary onClick={ this.onUnlockStyleButtonClick }>
				{ primaryOption.label }
			</Button>
		);
	};

	render() {
		const { themeId, siteId, demoUrl, children, isWPForTeamsSite } = this.props;
		const { showActionIndicator, showUnlockStyleUpgradeModal } = this.state;

		if ( ! themeId || isWPForTeamsSite ) {
			return null;
		}

		return (
			<div>
				<QueryCanonicalTheme siteId={ siteId } themeId={ themeId } />
				{ children }
				{ demoUrl && (
					<WebPreview
						showPreview={ true }
						showExternal={ false }
						showSEO={ false }
						onClose={ this.props.hideThemePreview }
						previewUrl={ this.appendStyleVariationOptionToUrl(
							demoUrl + '?demo=true&iframe=true&theme_preview=true',
							'title'
						) }
						externalUrl={ demoUrl }
						belowToolbar={ this.props.belowToolbar }
					>
						{ showActionIndicator && <PulsingDot active={ true } /> }
						{ ! showActionIndicator && this.renderSecondaryButton() }
						{ ! showActionIndicator &&
							( this.shouldShowUnlockStyleButton()
								? this.renderUnlockStyleButton()
								: this.renderPrimaryButton() ) }
					</WebPreview>
				) }
				{ showUnlockStyleUpgradeModal && (
					<PremiumGlobalStylesUpgradeModal
						checkout={ this.onPremiumGlobalStylesUpgradeModalCheckout }
						tryStyle={ this.onPremiumGlobalStylesUpgradeModalTryStyle }
						closeModal={ this.onPremiumGlobalStylesUpgradeModalClose }
						isOpen
					/>
				) }
			</div>
		);
	}
}

const withSiteGlobalStylesStatus = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { siteId } = props;
		const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

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
		const siteSlug = getSiteSlug( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );
		const themeOptions = getThemePreviewThemeOptions( state );
		return {
			themeId,
			siteId,
			siteSlug,
			isJetpack,
			themeOptions,
			isInstalling: isInstallingTheme( state, themeId, siteId ),
			isActive: isThemeActive( state, themeId, siteId ),
			isActivating: isActivatingTheme( state, siteId ),
			demoUrl: getThemeDemoUrl( state, themeId, siteId ),
			isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
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
	{ hideThemePreview, recordTracksEvent }
)( withSiteGlobalStylesStatus( localize( ConnectedThemePreview ) ) );
