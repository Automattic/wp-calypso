import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import PulsingDot from 'calypso/components/pulsing-dot';
import WebPreview from 'calypso/components/web-preview';
import { isJetpackSite } from 'calypso/state/sites/selectors';
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

	renderPrimaryButton = () => {
		const primaryOption = this.getPrimaryOption();
		const buttonHref = primaryOption.getUrl ? primaryOption.getUrl( this.props.themeId ) : null;

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
		const buttonHref = secondaryButton.getUrl ? secondaryButton.getUrl( this.props.themeId ) : null;
		return (
			<Button onClick={ this.onSecondaryButtonClick } href={ buttonHref }>
				{ secondaryButton.label }
			</Button>
		);
	};

	render() {
		const { themeId, siteId, demoUrl, children } = this.props;
		const { showActionIndicator } = this.state;
		if ( ! themeId ) {
			return null;
		}

		return (
			<div>
				{ <QueryCanonicalTheme siteId={ siteId } themeId={ themeId } /> }
				{ children }
				{ demoUrl && (
					<WebPreview
						showPreview={ true }
						showExternal={ false }
						showSEO={ false }
						onClose={ this.props.hideThemePreview }
						previewUrl={ this.props.demoUrl + '?demo=true&iframe=true&theme_preview=true' }
						externalUrl={ this.props.demoUrl }
						belowToolbar={ this.props.belowToolbar }
					>
						{ showActionIndicator && <PulsingDot active={ true } /> }
						{ ! showActionIndicator && this.renderSecondaryButton() }
						{ ! showActionIndicator && this.renderPrimaryButton() }
					</WebPreview>
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
		const isJetpack = isJetpackSite( state, siteId );
		const themeOptions = getThemePreviewThemeOptions( state );
		return {
			themeId,
			siteId,
			isJetpack,
			themeOptions,
			isInstalling: isInstallingTheme( state, themeId, siteId ),
			isActive: isThemeActive( state, themeId, siteId ),
			isActivating: isActivatingTheme( state, siteId ),
			demoUrl: getThemeDemoUrl( state, themeId, siteId ),
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
	{ hideThemePreview }
)( localize( ConnectedThemePreview ) );
