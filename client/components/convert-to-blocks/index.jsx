/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class ConvertToBlocksDialog extends Component {
	static propTypes = {
		showDialog: PropTypes.bool,
		handleConversionResponse: PropTypes.func,
	};

	close = ( action ) => {
		this.props.handleResponse( action === 'convert' );
	};

	render() {
		const { translate, showDialog } = this.props;

		const buttons = [
			{
				action: 'convert',
				isPrimary: true,
				label: translate( 'Convert to Blocks' ),
			},
			{
				action: 'cancel',
				label: translate( 'Stick with the Classic Block' ),
			},
		];

		return (
			<Dialog
				additionalClassNames="editor__gutenberg-convert-blocks-dialog"
				buttons={ buttons }
				isVisible={ showDialog }
				onClose={ this.close }
			>
				<h1>{ translate( 'Convert to blocks?' ) }</h1>

				<p>
					{ translate(
						'This post contains content you created using the older editor. You can convert this content to blocks, or you can stick with the classic block to simulate the older editor.'
					) }
				</p>
			</Dialog>
		);
	}
}

export default localize( ConvertToBlocksDialog );
