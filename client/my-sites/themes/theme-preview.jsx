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
		onClose: React.PropTypes.func,
		buttonLabel: React.PropTypes.string,
		onButtonClick: React.PropTypes.func,
		getButtonHref: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onButtonClick: noop,
			getButtonHref: () => null
		};
	},

	onButtonClick() {
		this.props.onButtonClick( this.props.theme );
		this.props.onClose();
	},

	render() {
		const previewUrl = getPreviewUrl( this.props.theme ),
			buttonHref = this.props.getButtonHref( this.props.theme );

		return (
			<WebPreview showPreview={ this.props.showPreview }
				onClose={ this.props.onClose }
				previewUrl={ previewUrl }
				externalUrl={ this.props.theme.demo_uri } >
				<Button primary
					onClick={ this.onButtonClick }
					href={ buttonHref }
					>{ this.props.buttonLabel }</Button>
			</WebPreview>
		);
	}
} );
