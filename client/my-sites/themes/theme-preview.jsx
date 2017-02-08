/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import QueryTheme from 'components/data/query-theme';
import { connectOptions } from './theme-options';
import { getThemeForPreviewData, getTheme, getThemePreviewState } from 'state/themes/selectors';
import { getPreviewUrl } from 'my-sites/themes/helpers';
import { localize } from 'i18n-calypso';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { closeThemePreview } from 'state/themes/actions';
import WebPreview from 'components/web-preview';

const ThemePreview = React.createClass( {
	displayName: 'ThemePreview',

	propTypes: {
		theme: React.PropTypes.object,
		showPreview: React.PropTypes.bool,
		showExternal: React.PropTypes.bool,
		onClose: React.PropTypes.func,
		getPrimaryButtonHref: React.PropTypes.func,
		secondaryButtonLabel: React.PropTypes.string,
		onSecondaryButtonClick: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			getPrimaryButtonHref: () => null,
			onSecondaryButtonClick: noop,
		};
	},

	onPrimaryButtonClick() {
		const option = this.getPrimaryOption();
		option.action && option.action( this.props.theme );
		this.props.closeThemePreview();
	},

	onSecondaryButtonClick() {
		const secondary = this.getSecondaryOption();
		secondary.action && secondary.action( this.props.theme );
		this.props.closeThemePreview();
	},

	getPrimaryOption() {
		const { translate } = this.props;
		const { purchase } = this.props.options;
		const { price } = this.props.theme;
		let { primary } = this.props.previewData.themeOptions;
		primary.label = translate( 'Activate this design' );

		if ( price && purchase ) {
			primary = purchase;
			primary.label = translate( 'Purchase this design' );
		}
		return primary;
	},

	getSecondaryOption() {
		return this.props.previewData.themeOptions.secondary;
	},

	renderSecondaryButton() {
		const secondaryButton = this.getSecondaryOption();
		if ( ! secondaryButton ) {
			return;
		}
		const buttonHref = secondaryButton.getUrl ? secondaryButton.getUrl( this.props.theme ) : null;
		return (
			<Button onClick={ this.onSecondaryButtonClick } href={ buttonHref } >
				{ secondaryButton.label }
			</Button>
		);
	},

	render() {
		if ( ! this.props.showPreview ) {
			return null;
		}

		const primaryOption = this.getPrimaryOption();
		const buttonHref = primaryOption.getUrl ? primaryOption.getUrl( this.props.theme ) : null;

		return (
			<div>
				{ this.props.isJetpack && <QueryTheme themeId={ this.props.theme.id } siteId="wporg" /> }
				<WebPreview
					showPreview={ this.props.showPreview }
					showExternal={ this.props.showExternal }
					showSEO={ false }
					onClose={ this.props.closeThemePreview }
					previewUrl={ this.props.previewUrl } >
					{ this.renderSecondaryButton() }
					<Button primary onClick={ this.onPrimaryButtonClick } href={ buttonHref } >
						{ primaryOption.label }
					</Button>
				</WebPreview>
			</div>
		);
	}
} );

// make all actions available to preview.
const ConnectedThemePreview = connectOptions( ThemePreview );

export default connect(
	( state ) => {
		const showPreview = getThemePreviewState( state ) === 'enabled';

		// data for preview not set.
		if ( ! showPreview ) {
			return { showPreview }
		}
		const previewData = getThemeForPreviewData( state );
		const theme = getTheme( state, previewData.themeData.siteId, previewData.themeData.themeId );
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		return {
			theme,
			siteId,
			isJetpack,
			previewData,
			showPreview,
			previewUrl: getPreviewUrl( theme ),
			options: [
				'activate',
				'preview',
				'purchase',
				'tryandcustomize',
				'customize',
				'separator',
				'info',
				'support',
				'help',
			]
		};
	},
	{ closeThemePreview }
)( localize( ConnectedThemePreview ) );
