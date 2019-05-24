/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';

/**
 * Style dependencies
 */
import './style.scss';

class ConvertToBlocksDialog extends Component {
	static propTypes = {
		close: PropTypes.func,
		showDialog: PropTypes.bool,
		confirmConversion: PropTypes.func,
	};

	shouldComponentUpdate( nextProps ) {
		return this.props.showDialog !== nextProps.showDialog;
	}

	render() {
		if ( this.props.isDirty ) {
			return null;
		}

		const { translate, showDialog, close, confirmConversion } = this.props;

		const buttons = [
			{
				action: 'convert',
				isPrimary: true,
				label: translate( 'Convert to Blocks' ),
				onClick: confirmConversion,
			},
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
				onClick: close,
			},
		];

		return (
			<Dialog
				additionalClassNames="editor__gutenberg-convert-blocks-dialog"
				buttons={ buttons }
				isVisible={ showDialog }
				onClose={ close }
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
