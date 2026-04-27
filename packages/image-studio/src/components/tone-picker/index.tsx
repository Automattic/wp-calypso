import { AgentUI, cn } from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import tonesInformativePreview from '../../assets/video/tones/informative.webp';
import tonesPromotionalPreview from '../../assets/video/tones/promotional.webp';
import { store as imageStudioStore } from '../../store';
import { ImageStudioMode } from '../../types';
import { trackImageStudioStyleSelected } from '../../utils/tracking';
import { BrushIcon } from '../icons/BrushIcon';

interface TonePickerProps {
	disabled?: boolean;
	mode: ImageStudioMode;
}

export const TONE_OPTIONS = [
	{
		label: __( 'Informative', __i18n_text_domain__ ),
		value: 'informative',
		preview: tonesInformativePreview,
	},
	{
		label: __( 'Promotional', __i18n_text_domain__ ),
		value: 'promotional',
		preview: tonesPromotionalPreview,
	},
];

export function TonePicker( { disabled = false, mode }: TonePickerProps ) {
	const { setSelectedTone } = useDispatch( imageStudioStore );

	const selectedTone = useSelect( ( select ) => {
		return select( imageStudioStore ).getSelectedTone();
	}, [] );

	const handleToneSelect = ( value: string ) => {
		setSelectedTone( value );
		// Re-use the style-selection tracker so tone events land in the same Tracks bucket.
		trackImageStudioStyleSelected( { style: `tone:${ value }`, mode } );
		requestAnimationFrame( () => {
			document.body.dispatchEvent(
				new MouseEvent( 'mousedown', {
					bubbles: true,
					cancelable: true,
				} )
			);
		} );
	};

	const selectedLabel =
		TONE_OPTIONS.find( ( opt ) => opt.value === selectedTone )?.label ??
		__( 'Tone', __i18n_text_domain__ );

	return (
		<AgentUI.InputToolbar
			label={ selectedLabel }
			icon={ <BrushIcon size={ 16 } /> }
			className="image-studio-input-toolbar-item"
			disabled={ disabled }
		>
			<div className="image-studio-input-toolbar-dialog-grid">
				{ TONE_OPTIONS.map( ( option ) => (
					<button
						key={ option.value }
						type="button"
						className={ cn( 'image-studio-input-toolbar-card', {
							'is-selected': selectedTone === option.value,
						} ) }
						onClick={ () => handleToneSelect( option.value ) }
					>
						<span className="image-studio-input-toolbar-card__image-wrapper">
							<img
								src={ option.preview ?? '' }
								alt=""
								className="image-studio-input-toolbar-card__image"
							/>
						</span>
						<span className="image-studio-input-toolbar-card__label">{ option.label }</span>
					</button>
				) ) }
			</div>
		</AgentUI.InputToolbar>
	);
}
