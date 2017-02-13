/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import QueryTheme from 'components/data/query-theme';
import { connectOptions } from './theme-options';
import {
	getThemePreviewInfo,
	getThemePreviewThemeOptions,
	getTheme,
	isThemePreviewVisible,
	isThemeActive
} from 'state/themes/selectors';
import { getPreviewUrl } from 'my-sites/themes/helpers';
import { localize } from 'i18n-calypso';
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
		showPreview: React.PropTypes.bool,
		showExternal: React.PropTypes.bool,
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
		if ( ! this.props.showPreview ) {
			return null;
		}

		const primaryOption = this.getPrimaryOption();
		const buttonHref = primaryOption.getUrl ? primaryOption.getUrl( this.props.theme ) : null;
		const themeId = this.props.themePreviewInfo.themeId;

		return (
			<div>
				{ this.props.isJetpack && <QueryTheme themeId={ themeId } siteId="wporg" /> }
				{ this.props.previewUrl && <WebPreview
					showPreview={ this.props.showPreview }
					showExternal={ this.props.showExternal }
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
		const showPreview = isThemePreviewVisible( state );

		// data for preview not set.
		if ( ! showPreview ) {
			return { showPreview };
		}
		const themePreviewInfo = getThemePreviewInfo( state );
		const themeOptions = getThemePreviewThemeOptions( state );
		const theme = getTheme( state, themePreviewInfo.source, themePreviewInfo.themeId );
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		return {
			theme,
			siteId,
			isJetpack,
			themePreviewInfo,
			themeOptions,
			showPreview,
			isActive: isThemeActive( state, themePreviewInfo.themeId, siteId ),
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
