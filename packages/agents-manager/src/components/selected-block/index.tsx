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

const SELECTED_BLOCK_CLEAR_EVENT = 'agents-manager-selected-block-cleared';

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

	// The unified post/site editor normalizes the legacy `core/edit-post` and
	// `core/edit-site` scopes to `core`, and exposes the block inspector under
	// the `edit-post/block` identifier.
	const isBlockSettingsOpen = useSelect(
		( select ) =>
			(
				select( 'core/interface' ) as {
					getActiveComplementaryArea?: ( scope: string ) => string | null;
				}
			 ).getActiveComplementaryArea?.( 'core' ) === 'edit-post/block',
		[]
	);

	const { clearSelectedBlock, selectBlock } = useDispatch( blockEditorStore );
	// The block settings sidebar is a complementary area of the interface store,
	// registered at runtime by the host post/site editor.
	const { enableComplementaryArea, disableComplementaryArea } = useDispatch( 'core/interface' ) as {
		enableComplementaryArea?: ( scope: string, area: string ) => void;
		disableComplementaryArea?: ( scope: string ) => void;
	};

	const handleClearSelectedBlock = () => {
		clearSelectedBlock();
		window.dispatchEvent( new Event( SELECTED_BLOCK_CLEAR_EVENT ) );
	};

	const handleToggleBlockSettings = () => {
		if ( ! block ) {
			return;
		}
		if ( isBlockSettingsOpen ) {
			disableComplementaryArea?.( 'core' );
			return;
		}
		selectBlock( block.clientId );
		enableComplementaryArea?.( 'core', 'edit-post/block' );
	};

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
			<Button
				className="agents-manager-selected-block__info"
				onClick={ handleToggleBlockSettings }
				label={
					isBlockSettingsOpen
						? __( 'Close block settings', __i18n_text_domain__ )
						: __( 'Open block settings', __i18n_text_domain__ )
				}
				showTooltip
			>
				<BlockIcon icon={ icon } />
				<span className="agents-manager-selected-block__name">{ name }</span>
			</Button>
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
