/**
 * External dependencies
 */
import { castArray, get, some } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Dropdown, IconButton, Toolbar, PanelBody } from '@wordpress/components';
import { getBlockType, getPossibleBlockTransformations, switchToBlockType, hasChildBlocks } from '@wordpress/blocks';
import { compose, Component, Fragment } from '@wordpress/element';
import { DOWN } from '@wordpress/keycodes';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockIcon from '../block-icon';
import BlockStyles from '../block-styles';
import BlockPreview from '../block-preview';
import BlockTypesList from '../block-types-list';

export class BlockSwitcher extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			hoveredClassName: null,
		};
		this.onHoverClassName = this.onHoverClassName.bind( this );
	}

	onHoverClassName( className ) {
		this.setState( { hoveredClassName: className } );
	}

	render() {
		const { blocks, onTransform, isLocked } = this.props;
		const { hoveredClassName } = this.state;

		if ( ! blocks || ! blocks.length ) {
			return null;
		}

		const allowedBlocks = getPossibleBlockTransformations( blocks );
		const sourceBlockName = blocks[ 0 ].name;
		const blockType = getBlockType( sourceBlockName );
		const hasStyles = blocks.length === 1 && get( blockType, [ 'styles' ], [] ).length !== 0;

		if ( ! hasStyles && ( ! allowedBlocks.length || isLocked ) ) {
			return null;
		}

		return (
			<Dropdown
				position="bottom right"
				className="editor-block-switcher"
				contentClassName="editor-block-switcher__popover"
				renderToggle={ ( { onToggle, isOpen } ) => {
					const openOnArrowDown = ( event ) => {
						if ( ! isOpen && event.keyCode === DOWN ) {
							event.preventDefault();
							event.stopPropagation();
							onToggle();
						}
					};
					const label = __( 'Change block type' );

					return (
						<Toolbar>
							<IconButton
								className="editor-block-switcher__toggle"
								onClick={ onToggle }
								aria-haspopup="true"
								aria-expanded={ isOpen }
								label={ label }
								tooltip={ label }
								onKeyDown={ openOnArrowDown }
							>
								<BlockIcon icon={ blockType.icon && blockType.icon.src } showColors />
							</IconButton>
						</Toolbar>
					);
				} }
				renderContent={ ( { onClose } ) => (
					<Fragment>
						{ hasStyles &&
							<PanelBody
								title={ __( 'Block Styles' ) }
								initialOpen
							>
								<BlockStyles uid={ blocks[ 0 ].uid } onSwitch={ onClose } onHoverClassName={ this.onHoverClassName } />
							</PanelBody>
						}
						{ allowedBlocks.length !== 0 && ! isLocked &&
							<PanelBody
								title={ __( 'Transform To:' ) }
								initialOpen
							>
								<BlockTypesList
									items={ allowedBlocks.map( ( destinationBlockType ) => ( {
										id: destinationBlockType.name,
										icon: destinationBlockType.icon,
										title: destinationBlockType.title,
										hasChildBlocks: hasChildBlocks( destinationBlockType.name ),
									} ) ) }
									onSelect={ ( item ) => {
										onTransform( blocks, item.id );
										onClose();
									} }
								/>
							</PanelBody>
						}

						{ ( hoveredClassName !== null ) &&
							<BlockPreview
								name={ blocks[ 0 ].name }
								attributes={ { ...blocks[ 0 ].attributes, className: hoveredClassName } }
							/>
						}
					</Fragment>
				) }
			/>
		);
	}
}

export default compose(
	withSelect( ( select, ownProps ) => {
		const { getBlock, getBlockRootUID, getTemplateLock } = select( 'core/editor' );
		return {
			blocks: ownProps.uids.map( getBlock ),
			isLocked: some( castArray( ownProps.uids ), ( uid ) => !! getTemplateLock( getBlockRootUID( uid ) ) ),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => ( {
		onTransform( blocks, name ) {
			dispatch( 'core/editor' ).replaceBlocks(
				ownProps.uids,
				switchToBlockType( blocks, name )
			);
		},
	} ) ),
)( BlockSwitcher );
