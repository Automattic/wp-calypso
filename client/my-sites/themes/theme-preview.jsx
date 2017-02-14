/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import QueryTheme from 'components/data/query-theme';
import { connectOptions } from './theme-options';
import {
	getThemePreviewThemeOptions,
	getTheme,
	themePreviewVisibility,
	isThemeActive
} from 'state/themes/selectors';
import { getPreviewUrl } from 'my-sites/themes/helpers';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { hideThemePreview } from 'state/themes/actions';
import WebPreview from 'components/web-preview';

const ThemePreview = React.createClass( {
	displayName: 'ThemePreview',

	propTypes: {
		theme: React.PropTypes.object,
		themeOptions: React.PropTypes.object,
		isActive: React.PropTypes.bool,
		onClose: React.PropTypes.func,
	},

	onPrimaryButtonClick() {
		const option = this.getPrimaryOption();
		option.action && option.action( this.props.theme );
		this.props.hideThemePreview();
	},

	onSecondaryButtonClick() {
		const secondary = this.getSecondaryOption();
		secondary.action && secondary.action( this.props.theme );
		this.props.hideThemePreview();
	},

	getPrimaryOption() {
		return this.props.themeOptions.primary;
	},

	getSecondaryOption() {
		const { isActive } = this.props;
		return isActive ? null : this.props.themeOptions.secondary;
	},

	renderSecondaryButton() {
		const secondaryButton = this.getSecondaryOption();
		if ( ! secondaryButton ) {
			return;
		}
		const buttonHref = secondaryButton.getUrl ? secondaryButton.getUrl( this.props.theme ) : null;
		return (
			<Button onClick={ this.onSecondaryButtonClick } href={ buttonHref } >
				{ secondaryButton.extendedLabel }
			</Button>
		);
	},

	render() {
		if ( ! this.props.theme ) {
			return null;
		}

		const primaryOption = this.getPrimaryOption();
		const buttonHref = primaryOption.getUrl ? primaryOption.getUrl( this.props.theme ) : null;
		const themeId = this.props.theme.ID;

		return (
			<div>
				{ this.props.isJetpack && <QueryTheme themeId={ themeId } siteId="wporg" /> }
				{ this.props.previewUrl && <WebPreview
					showPreview={ !! this.props.theme }
					showExternal={ false }
					showSEO={ false }
					onClose={ this.props.hideThemePreview }
					previewUrl={ this.props.previewUrl }
					externalUrl={ this.props.theme.demo_uri } >
					{ this.renderSecondaryButton() }
					<Button primary onClick={ this.onPrimaryButtonClick } href={ buttonHref } >
						{ primaryOption.extendedLabel }
					</Button>
				</WebPreview> }
			</div>
		);
	}
} );

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
		let theme = getTheme( state, 'wpcom', themeId );

		if ( ! theme && isJetpack ) {
			//for Jetpack sites if theme is not from wpcom we fetch demo data
			//from wporg because data from Jetpack enpoint does not have demo_uri
			theme = getTheme( state, 'wporg', themeId );
		}

		const themeOptions = getThemePreviewThemeOptions( state );
		return {
			theme,
			siteId,
			isJetpack,
			themeOptions,
			isActive: isThemeActive( state, themeId, siteId ),
			previewUrl: theme ? getPreviewUrl( theme ) : null,
			options: [
				'activate',
				'preview',
				'purchase',
				'tryandcustomize',
				'customize',
				'separator',
				'info',
				'signup',
				'support',
				'help',
			]
		};
	},
	{ hideThemePreview }
)( localize( ConnectedThemePreview ) );
