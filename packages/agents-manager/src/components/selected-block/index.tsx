import { store as blockEditorStore, BlockIcon } from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
import { Button, __unstableMotion as motion } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
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

export default function SelectedBlock() {
	const { block, name, icon } = useSelect( ( select ) => {
		const selectedBlock = select( blockEditorStore ).getSelectedBlock();

		if ( ! selectedBlock ) {
			return {
				block: null,
				name: null,
				icon: null,
			};
		}

		const blockType = getBlockType( selectedBlock.name );

		return {
			block: selectedBlock,
			name: selectedBlock.attributes?.content?.text || blockType?.title,
			icon: blockType?.icon,
		};
	}, [] );

	const { clearSelectedBlock } = useDispatch( blockEditorStore );

	if ( ! block ) {
		return null;
	}

	return (
		<motion.div
			key={ name }
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
				onClick={ clearSelectedBlock }
				label={ __( 'Clear selection', 'big-sky' ) }
			/>
		</motion.div>
	);
}
