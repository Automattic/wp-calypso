/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import WebPreview from 'components/web-preview';
import Button from 'components/button';
import { getPreviewUrl } from './helpers';

export default React.createClass( {
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
		const previewUrl = getPreviewUrl( this.props.theme );
		const buttonHref = this.props.getPrimaryButtonHref ? this.props.getPrimaryButtonHref( this.props.theme ) : null;

		return (
			<WebPreview showPreview={ this.props.showPreview }
				showExternal={ this.props.showExternal }
				onClose={ this.props.onClose }
				previewUrl={ previewUrl }
				externalUrl={ this.props.theme.demo_uri } >
				{ this.renderSecondaryButton() }
				<Button primary onClick={ this.onPrimaryButtonClick } href={ buttonHref } >
					{ this.props.primaryButtonLabel }
				</Button>
			</WebPreview>
		);
	}
} );
