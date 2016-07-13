/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

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
		onButtonClick: React.PropTypes.func
	},

	onButtonClick() {
		this.props.onButtonClick( this.props.theme );
		this.props.onClose();
	},

	render() {
		const previewUrl = getPreviewUrl( this.props.theme );

		return (
			<WebPreview showPreview={ this.props.showPreview }
				onClose={ this.props.onClose }
				previewUrl={ previewUrl }
				externalUrl={ this.props.theme.demo_uri } >
				<Button primary
					onClick={ this.onButtonClick }
					>{ this.props.buttonLabel }</Button>
			</WebPreview>
		);
	}
} );
