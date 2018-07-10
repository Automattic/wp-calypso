/**
 * External dependencies
 */
import { pick, isEqual, map } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withContext } from '@wordpress/components';
import { withViewportMatch } from '@wordpress/viewport';
import { Component, compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { synchronizeBlocksWithTemplate } from '@wordpress/blocks';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockList from '../block-list';
import { withBlockEditContext } from '../block-edit/context';

class InnerBlocks extends Component {
	constructor() {
		super( ...arguments );

		this.updateNestedSettings();
	}

	componentDidMount() {
		this.synchronizeBlocksWithTemplate();
	}

	componentDidUpdate( prevProps ) {
		const { template } = this.props;

		this.updateNestedSettings();

		const hasTemplateChanged = ! isEqual( template, prevProps.template );
		if ( hasTemplateChanged ) {
			this.synchronizeBlocksWithTemplate();
		}
	}

	/**
	 * Called on mount or when a mismatch exists between the templates and
	 * inner blocks, synchronizes inner blocks with the template, replacing
	 * current blocks.
	 */
	synchronizeBlocksWithTemplate() {
		const { template, block, replaceInnerBlocks } = this.props;
		const { innerBlocks } = block;

		// Synchronize with templates. If the next set differs, replace.
		const nextBlocks = synchronizeBlocksWithTemplate( innerBlocks, template );
		if ( ! isEqual( nextBlocks, innerBlocks	) ) {
			replaceInnerBlocks( nextBlocks );
		}
	}

	updateNestedSettings() {
		const {
			blockListSettings,
			allowedBlocks,
			templateLock,
			parentLock,
			updateNestedSettings,
		} = this.props;

		const newSettings = {
			allowedBlocks,
			templateLock: templateLock === undefined ? parentLock : templateLock,
		};

		if ( ! isShallowEqual( blockListSettings, newSettings ) ) {
			updateNestedSettings( newSettings );
		}
	}

	render() {
		const {
			uid,
			layouts,
			allowedBlocks,
			templateLock,
			template,
			isSmallScreen,
			isSelectedBlockInRoot,
		} = this.props;

		const classes = classnames( 'editor-inner-blocks', {
			'has-overlay': isSmallScreen && ! isSelectedBlockInRoot,
		} );

		return (
			<div className={ classes }>
				<BlockList
					rootUID={ uid }
					{ ...{ layouts, allowedBlocks, templateLock, template } }
				/>
			</div>
		);
	}
}

InnerBlocks = compose( [
	withBlockEditContext( ( context ) => pick( context, [ 'uid' ] ) ),
	withViewportMatch( { isSmallScreen: '< medium' } ),
	withSelect( ( select, ownProps ) => {
		const {
			isBlockSelected,
			hasSelectedInnerBlock,
			getBlock,
			getBlockListSettings,
			getBlockRootUID,
			getTemplateLock,
		} = select( 'core/editor' );
		const { uid } = ownProps;
		const parentUID = getBlockRootUID( uid );
		return {
			isSelectedBlockInRoot: isBlockSelected( uid ) || hasSelectedInnerBlock( uid ),
			block: getBlock( uid ),
			blockListSettings: getBlockListSettings( uid ),
			parentLock: getTemplateLock( parentUID ),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const {
			replaceBlocks,
			insertBlocks,
			updateBlockListSettings,
		} = dispatch( 'core/editor' );
		const { block, uid } = ownProps;

		return {
			replaceInnerBlocks( blocks ) {
				const uids = map( block.innerBlocks, 'uid' );
				if ( uids.length ) {
					replaceBlocks( uids, blocks );
				} else {
					insertBlocks( blocks, undefined, uid );
				}
			},
			updateNestedSettings( settings ) {
				dispatch( updateBlockListSettings( uid, settings ) );
			},
		};
	} ),
] )( InnerBlocks );

InnerBlocks.Content = ( { BlockContent } ) => {
	return <BlockContent />;
};

InnerBlocks.Content = withContext( 'BlockContent' )()( InnerBlocks.Content );

export default InnerBlocks;
