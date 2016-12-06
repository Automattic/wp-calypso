/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import WebPreview from 'components/web-preview';
import Button from 'components/button';
import { hideThemePreview } from 'state/themes/actions';
import { getPreviewedTheme, getThemePreviewUrl } from 'state/themes/selectors';
import { getThemeById } from 'state/themes/themes/selectors';

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
		this.props.hidePreview();
	},

	onSecondaryButtonClick() {
		this.props.onSecondaryButtonClick( this.props.theme );
		this.props.hidePreview();
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
		const { hidePreview, previewUrl, theme } = this.props;
		const buttonHref = this.props.getPrimaryButtonHref ? this.props.getPrimaryButtonHref( this.props.theme ) : null;

		return (
			<WebPreview
				showPreview={ !! theme }
				showExternal={ this.props.showExternal }
				showSEO={ false }
				onClose={ hidePreview }
				previewUrl={ previewUrl }
				externalUrl={ get( theme, 'demo_uri' ) } >
				{ this.renderSecondaryButton() }
				<Button primary onClick={ this.onPrimaryButtonClick } href={ buttonHref } >
					{ this.props.primaryButtonLabel }
				</Button>
			</WebPreview>
		);
	}
} );

export default connect(
	( state ) => {
		const themeId = getPreviewedTheme( state );
		const theme = getThemeById( state, themeId );
		return {
			theme,
			previewUrl: getThemePreviewUrl( state, theme )
		};
	},
	{ hidePreview: hideThemePreview }
)( ThemePreview );
