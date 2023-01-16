import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { getDesignPreviewUrl } from '@automattic/design-picker';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import PulsingDot from 'calypso/components/pulsing-dot';
import ThemePreviewModal from 'calypso/components/theme-preview-modal';
import WebPreview from 'calypso/components/web-preview';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { hideThemePreview, setThemePreviewOptions } from 'calypso/state/themes/actions';
import {
	getCanonicalTheme,
	getThemeDemoUrl,
	getThemePreviewThemeOptions,
	themePreviewVisibility,
	isThemeActive,
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
		isActive: PropTypes.bool,
		isInstalling: PropTypes.bool,
		isJetpack: PropTypes.bool,
		themeId: PropTypes.string,
		themeOptions: PropTypes.object,
	};

	state = {
		showActionIndicator: false,
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

	onPrimaryButtonClick = () => {
		const option = this.getPrimaryOption();
		option.action && option.action( this.props.themeId );
		! this.props.isJetpack && this.props.hideThemePreview();
	};

	onSecondaryButtonClick = () => {
		const secondary = this.getSecondaryOption();
		secondary.action && secondary.action( this.props.themeId );
		! this.props.isJetpack && this.props.hideThemePreview();
	};

	getPrimaryOption = () => {
		return this.props.themeOptions.primary;
	};

	getSecondaryOption = () => {
		const { isActive } = this.props;
		return isActive ? null : this.props.themeOptions.secondary;
	};

	getStyleVariationOption = () => {
		return this.props.themeOptions.styleVariation;
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

	getPreviewUrl = () => {
		const { demoUrl, locale, theme } = this.props;
		if ( isEnabled( 'themes/showcase-i4/details-and-preview' ) ) {
			return getDesignPreviewUrl( { slug: theme.id, recipe: theme }, { language: locale } );
		}

		return demoUrl + '?demo=true&iframe=true&theme_preview=true';
	};

	onSelectVariation = ( variation ) => {
		const { themeId, primary, secondary } = this.props.themeOptions;
		this.props.setThemePreviewOptions( themeId, primary, secondary, variation );
	};

	render() {
		const { theme, themeId, siteId, demoUrl, children, isWPForTeamsSite } = this.props;
		const { showActionIndicator } = this.state;
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
							selectedVariation={ this.getStyleVariationOption() }
							actionButtons={ this.renderPrimaryButton() }
							onSelectVariation={ this.onSelectVariation }
							onClose={ this.props.hideThemePreview }
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
		const isJetpack = isJetpackSite( state, siteId );
		const themeOptions = getThemePreviewThemeOptions( state );
		return {
			theme: getCanonicalTheme( state, siteId, themeId ),
			themeId,
			siteId,
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
	{ hideThemePreview, setThemePreviewOptions }
)( localize( ConnectedThemePreview ) );
