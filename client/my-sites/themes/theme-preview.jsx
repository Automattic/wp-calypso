import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import WebPreview from 'calypso/components/web-preview';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { hideThemePreview } from 'calypso/state/themes/actions';
import {
	getThemeDemoUrl,
	getThemePreviewThemeOptions,
	themePreviewVisibility,
	isInstallingTheme,
	isActivatingTheme,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { connectOptions } from './theme-options';

class ThemePreview extends Component {
	static displayName = 'ThemePreview';

	static propTypes = {
		// connected props
		belowToolbar: PropTypes.element,
		demoUrl: PropTypes.string,
		isActivating: PropTypes.bool,
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

	render() {
		const { themeId, siteId, demoUrl, children, isWPForTeamsSite } = this.props;
		const { showUnlockStyleUpgradeModal } = this.state;

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
					/>
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
)( localize( ConnectedThemePreview ) );
