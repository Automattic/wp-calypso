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
import { getPreviewUrl } from 'state/ui/preview/selectors';

export default function themePreview( WebPreview ) {
	const ThemePreview = React.createClass( {
		displayName: 'ThemePreview',

		propTypes: {
			theme: React.PropTypes.object,
			showPreview: React.PropTypes.bool,
			showExternal: React.PropTypes.bool,
			onClose: React.PropTypes.func,
			primaryButtonLabel: React.PropTypes.string.isRequired,
			onPrimaryButtonClick: React.PropTypes.func,
			getPrimaryButtonHref: React.PropTypes.func,
			secondaryButtonLabel: React.PropTypes.string,
			onSecondaryButtonClick: React.PropTypes.func,
			getSecondaryButtonHref: React.PropTypes.func,
		},

		getDefaultProps() {
			return {
				onPrimaryButtonClick: noop,
				getPrimaryButtonHref: () => null,
				onSecondaryButtonClick: noop,
				getSecondaryButtonHref: () => null,
			};
		},

		onPrimaryButtonClick() {
			this.props.onPrimaryButtonClick( this.props.theme );
			this.props.onClose();
		},

		onSecondaryButtonClick() {
			this.props.onSecondaryButtonClick( this.props.theme );
			this.props.onClose();
		},

		renderSecondaryButton() {
			if ( ! this.props.secondaryButtonLabel ) {
				return;
			}
			const buttonHref = this.props.getSecondaryButtonHref ? this.props.getSecondaryButtonHref( this.props.theme ) : null;
			return (
				<Button onClick={ this.onSecondaryButtonClick } href={ buttonHref } >
					{ this.props.secondaryButtonLabel }
				</Button>
			);
		},

		render() {
			const buttonHref = this.props.getPrimaryButtonHref ? this.props.getPrimaryButtonHref( this.props.theme ) : null;

			return (
				<WebPreview
					showPreview={ this.props.showPreview }
					showExternal={ this.props.showExternal }
					showSEO={ false }
					onClose={ this.props.onClose }
					previewUrl={ this.props.previewUrl } >
					{ this.renderSecondaryButton() }
					<Button primary onClick={ this.onPrimaryButtonClick } href={ buttonHref } >
						{ this.props.primaryButtonLabel }
					</Button>
				</WebPreview>
			);
		}
	} );

	const ConnectedThemePreview = connectOptions( ThemePreview );

	return connect(
		( state ) => {
			return {
				previewUrl: getPreviewUrl( state ),
				primaryButtonLabel: 'Hello There!',
				options: [
					'activateOnJetpack',
					'preview',
					'tryAndCustomizeOnJetpack',
					'customize',
					'separator',
					'info',
					'support',
					'help',
				]
			};
		}
	)( ConnectedThemePreview );
}
