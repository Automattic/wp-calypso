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
				label: translate( 'Cancel' ),
			},
		];

		return (
			<Dialog
				additionalClassNames="editor__gutenberg-convert-blocks-dialog"
				buttons={ buttons }
				isVisible={ showDialog }
				onClose={ this.close }
			>
				<h1>{ translate( 'Ready to try blocks?' ) }</h1>

				<p>
					{ translate(
						'This post contains content you created using the older editor. For the best editing experience, we recommend converting this content to blocks.'
					) }
				</p>
			</Dialog>
		);
	}
}

export default localize( ConvertToBlocksDialog );
