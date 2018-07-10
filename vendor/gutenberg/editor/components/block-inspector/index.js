/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { getBlockType } from '@wordpress/blocks';
import { PanelBody } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal Dependencies
 */
import './style.scss';
import SkipToSelectedBlock from '../skip-to-selected-block';
import BlockIcon from '../block-icon';
import InspectorControls from '../inspector-controls';
import InspectorAdvancedControls from '../inspector-advanced-controls';

const BlockInspector = ( { selectedBlock, blockType, count } ) => {
	if ( count > 1 ) {
		return <span className="editor-block-inspector__multi-blocks">{ __( 'Coming Soon' ) }</span>;
	}

	if ( ! selectedBlock ) {
		return <span className="editor-block-inspector__no-blocks">{ __( 'No block selected.' ) }</span>;
	}

	return [
		<div className="editor-block-inspector__card" key="card">
			<BlockIcon icon={ blockType.icon } showColors />
			<div className="editor-block-inspector__card-content">
				<div className="editor-block-inspector__card-title">{ blockType.title }</div>
				<div className="editor-block-inspector__card-description">{ blockType.description }</div>
			</div>
		</div>,
		<InspectorControls.Slot key="inspector-controls" />,
		<InspectorAdvancedControls.Slot key="inspector-advanced-controls">
			{ ( fills ) => ! isEmpty( fills ) && (
				<PanelBody
					className="editor-block-inspector__advanced"
					title={ __( 'Advanced' ) }
					initialOpen={ false }
				>
					{ fills }
				</PanelBody>
			) }
		</InspectorAdvancedControls.Slot>,
		<SkipToSelectedBlock key="back" />,
	];
};

export default withSelect(
	( select ) => {
		const { getSelectedBlock, getSelectedBlockCount } = select( 'core/editor' );
		const selectedBlock = getSelectedBlock();
		const blockType = selectedBlock && getBlockType( selectedBlock.name );
		return {
			selectedBlock,
			blockType,
			count: getSelectedBlockCount(),
		};
	}
)( BlockInspector );
