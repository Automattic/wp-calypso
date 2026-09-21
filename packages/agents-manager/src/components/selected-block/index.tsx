import { store as blockEditorStore, BlockIcon } from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
import { Button, __unstableMotion as motion } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { getSelectedTextContext } from './get-selected-text';
import './style.scss';

const animations = {
	hidden: {
		opacity: 0,
		scale: 0.9,
		x: -10,
	},
	visible: {
		opacity: 1,
		scale: 1,
		x: 0,
	},
};

const SELECTED_BLOCK_CLEAR_EVENT = 'agents-manager-selected-block-cleared';

export default function SelectedBlock() {
	const { clientId, name, icon } = useSelect( ( select ) => {
		const selectedBlock = select( blockEditorStore ).getSelectedBlock();

		if ( ! selectedBlock ) {
			return {
				clientId: null,
				name: null,
				icon: null,
			};
		}

		const blockType = getBlockType( selectedBlock.name );

		const selectedText = getSelectedTextContext( select );

		return {
			clientId: selectedBlock.clientId,
			name: selectedText
				? `“${ selectedText.text }”`
				: selectedBlock.attributes?.content?.text || blockType?.title,
			icon: blockType?.icon,
		};
	}, [] );

	const { clearSelectedBlock } = useDispatch( blockEditorStore );

	const handleClearSelectedBlock = () => {
		clearSelectedBlock();
		window.dispatchEvent( new Event( SELECTED_BLOCK_CLEAR_EVENT ) );
	};

	if ( ! clientId ) {
		return null;
	}

	// Keyed by block, not label: the label tracks the block's content, so a
	// label key would remount and re-animate the pill on every keystroke.
	return (
		<motion.div
			key={ clientId }
			className="agents-manager-selected-block"
			initial={ animations.hidden }
			animate={ animations.visible }
			exit={ animations.hidden }
		>
			<BlockIcon icon={ icon } />
			<span className="agents-manager-selected-block__name">{ name }</span>
			<hr className="agents-manager-selected-block__divider" />
			<Button
				className="agents-manager-selected-block__remove"
				icon={ close }
				iconSize={ 16 }
				onClick={ handleClearSelectedBlock }
				label={ __( 'Clear selection', __i18n_text_domain__ ) }
			/>
		</motion.div>
	);
}
