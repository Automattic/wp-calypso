import { AgentUI, cn } from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as imageStudioStore } from '../../store';
import { AspectRatioIcon } from '../icons/AspectRatioIcon';

interface AspectRatioPickerProps {
	disabled?: boolean;
}

export const ASPECT_RATIO_OPTIONS = [
	{ label: __( '1:1', 'big-sky' ), value: '1:1' },
	{ label: __( '16:9', 'big-sky' ), value: '16:9' },
	{ label: __( '9:16', 'big-sky' ), value: '9:16' },
	{ label: __( '4:3', 'big-sky' ), value: '4:3' },
	{ label: __( '3:4', 'big-sky' ), value: '3:4' },
];

export function AspectRatioPicker( { disabled = false }: AspectRatioPickerProps ) {
	const { setSelectedAspectRatio } = useDispatch( imageStudioStore );

	const selectedAspectRatio = useSelect(
		( select ) => select( imageStudioStore ).getSelectedAspectRatio(),
		[]
	);

	const handleAspectRatioSelect = ( value: string ) => {
		setSelectedAspectRatio( value );
		// Close dropdown by simulating mousedown outside
		// Use requestAnimationFrame to ensure this happens after the current frame
		requestAnimationFrame( () => {
			document.dispatchEvent( new MouseEvent( 'mousedown', { bubbles: true } ) );
		} );
	};

	const selectedLabel =
		ASPECT_RATIO_OPTIONS.find( ( opt ) => opt.value === selectedAspectRatio )?.label ??
		__( 'Aspect Ratio', 'big-sky' );

	return (
		<AgentUI.InputToolbar
			label={ selectedLabel }
			icon={ <AspectRatioIcon ratio={ selectedAspectRatio || '1:1' } size={ 13 } /> }
			className="image-studio-input-toolbar-item"
			disabled={ disabled }
		>
			<div className="image-studio-input-toolbar-dialog-grid">
				{ ASPECT_RATIO_OPTIONS.map( ( option ) => (
					<button
						key={ option.value }
						type="button"
						className={ cn( 'image-studio-input-toolbar-card', {
							'is-selected': selectedAspectRatio === option.value,
						} ) }
						onClick={ () => handleAspectRatioSelect( option.value ) }
					>
						<span className="image-studio-input-toolbar-card__icon-wrapper">
							<AspectRatioIcon
								ratio={ option.value }
								size={ 40 }
								className="image-studio-input-toolbar-card__icon"
							/>
						</span>
						<span className="image-studio-input-toolbar-card__label">{ option.label }</span>
					</button>
				) ) }
			</div>
		</AgentUI.InputToolbar>
	);
}
