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
import { connectOptions } from './theme-options';
import { getThemeForPreviewData, getTheme } from 'state/themes/selectors';
import { getPreviewUrl } from 'my-sites/themes/helpers';
import { localize } from 'i18n-calypso';
import { closePreview } from 'state/ui/preview/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

export default function themePreview( WebPreview ) {
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
			this.props.closePreview();
		},

		onSecondaryButtonClick() {
			const { tryAndCustomizeOnJetpack, tryandcustomize } = this.props.options;
			const option = tryAndCustomizeOnJetpack || tryandcustomize;
			option.action && option.action( this.props.theme );
			this.props.closePreview();
		},

		getPrimaryOption() {
			const { translate } = this.props;
			const { purchase, activate, activateOnJetpack } = this.props.options;
			const { price } = this.props.theme;
			let primaryOption = activate || activateOnJetpack;
			if ( price && purchase ) {
				primaryOption = purchase;
				primaryOption.label = translate( 'Pick this design' );
			} else if ( activate ) {
				primaryOption = activate;
				primaryOption.label = translate( 'Activate this design' );
			}
			return primaryOption;
		},

		renderSecondaryButton() {
			const { tryAndCustomizeOnJetpack, tryandcustomize } = this.props.options;
			const secondaryButton = tryAndCustomizeOnJetpack || tryandcustomize;
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
			const primaryOption = this.getPrimaryOption();
			const buttonHref = this.props.getPrimaryButtonHref ? this.props.getPrimaryButtonHref( this.props.theme ) : null;

			return (
				<WebPreview
					showPreview={ this.props.showPreview }
					showExternal={ this.props.showExternal }
					showSEO={ false }
					onClose={ this.props.closePreview }
					previewUrl={ this.props.previewUrl } >
					{ this.renderSecondaryButton() }
					<Button primary onClick={ this.onPrimaryButtonClick } href={ buttonHref } >
						{ primaryOption.label }
					</Button>
				</WebPreview>
			);
		}
	} );

	const ConnectedThemePreview = connectOptions( ThemePreview );

	return connect(
		( state ) => {
			const themeData = getThemeForPreviewData( state );
			const theme = getTheme( state, themeData.siteId, themeData.themeId );
			const siteId = getSelectedSiteId( state );
			return {
				theme,
				siteId,
				previewUrl: getPreviewUrl( theme ),
				secondaryOption: isJetpackSite( state, siteId ) ? 'tryAndCustomizeOnJetpack' : 'tryandcustomize',
				options: [
					'activate',
					'activateOnJetpack',
					'preview',
					'purchase',
					'tryAndCustomizeOnJetpack',
					'tryandcustomize',
					'customize',
					'separator',
					'info',
					'support',
					'help',
				]
			};
		},
		{ closePreview }
	)( localize( ConnectedThemePreview ) );
}
