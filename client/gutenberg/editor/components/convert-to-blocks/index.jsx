/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { rawHandler } from '@wordpress/blocks';

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
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	state = {
		isDialogVisible: false,
		isDismissed: false,
	};

	shouldComponentUpdate( nextProps, nextState ) {
		return this.state.isDialogVisible !== nextState.isDialogVisible;
	}

	static getDerivedStateFromProps( props, state ) {
		const { rootBlocks } = props;

		return {
			// Use the fact that classic posts will contain just one classic block to infer dialog visibility
			isDialogVisible:
				! state.isDismissed && rootBlocks.length === 1 && rootBlocks[ 0 ].name === 'a8c/classic',
		};
	}

	closeDialog = () => {
		this.setState( { isDismissed: true } );
	};

	render() {
		const { translate } = this.props;
		const { isDialogVisible } = this.state;

		const buttons = [
			{
				action: 'convert',
				label: translate( 'Convert to Blocks' ),
				onClick: this.props.convertToBlocks,
				isPrimary: true,
			},
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
				onClick: this.closeDialog,
			},
		];

		return (
			<Dialog
				additionalClassNames="editor-gutenberg-convert-blocks-dialog"
				isVisible={ isDialogVisible }
				buttons={ buttons }
				onClose={ this.closeDialog }
			>
				<h1>{ translate( 'This post uses content from the old editor' ) }</h1>

				<p>
					{ translate(
						'For the best editing experience we suggest that you convert old content to blocks.'
					) }
				</p>
			</Dialog>
		);
	}
}

const blockToBlocks = block =>
	rawHandler( {
		HTML: block.originalContent,
	} );

export default compose(
	withSelect( select => {
		const { getBlocks } = select( 'core/editor' );

		return {
			rootBlocks: getBlocks(),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const { replaceBlock } = dispatch( 'core/editor' );

		return {
			convertToBlocks() {
				const classicBlock = ownProps.rootBlocks[ 0 ];

				replaceBlock( classicBlock.clientId, blockToBlocks( classicBlock ) );
			},
		};
	} )
)( localize( ConvertToBlocksDialog ) );
