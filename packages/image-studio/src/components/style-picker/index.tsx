import { AgentUI, cn } from '@automattic/agenttic-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import threeDModelPreview from '../../assets/3d-model.webp';
import analogFilmPreview from '../../assets/analog-film.webp';
import animePreview from '../../assets/anime.webp';
import cinematicPreview from '../../assets/cinematic.webp';
import comicbookPreview from '../../assets/comicbook.webp';
import craftClayPreview from '../../assets/craft-clay.webp';
import digitalArtPreview from '../../assets/digital-art.webp';
import fantasyArtPreview from '../../assets/fantasy-art.webp';
import isometricPreview from '../../assets/isometric.webp';
import lineArtPreview from '../../assets/line-art.webp';
import lowpolyPreview from '../../assets/lowpoly.webp';
import neonpunkPreview from '../../assets/neonpunk.webp';
import nonePreview from '../../assets/none.webp';
import origamiPreview from '../../assets/origami.webp';
import photographicPreview from '../../assets/photographic.webp';
import pixelArtPreview from '../../assets/pixel-art.webp';
import texturePreview from '../../assets/texture.webp';
import informativePreview from '../../assets/video/styles/informative.webp';
import promotionalPreview from '../../assets/video/styles/promotional.webp';
import vividPreview from '../../assets/vivid.webp';
import { store as imageStudioStore } from '../../store';
import { store as videoStudioStore } from '../../stores/video-studio';
import { ImageStudioMode } from '../../types';
import { trackImageStudioStyleSelected } from '../../utils/tracking';
import { BrushIcon } from '../icons/BrushIcon';

export type StylePickerVariant = 'image' | 'video';

interface StylePickerProps {
	disabled?: boolean;
	mode: ImageStudioMode;
	variant?: StylePickerVariant;
}

export const STYLE_OPTIONS = [
	{ label: __( 'None', __i18n_text_domain__ ), value: 'none', preview: nonePreview },
	{
		label: __( 'Vivid', __i18n_text_domain__ ),
		value: 'vivid',
		preview: vividPreview,
	},
	{ label: __( 'Anime', __i18n_text_domain__ ), value: 'anime', preview: animePreview },
	{
		label: __( 'Photographic', __i18n_text_domain__ ),
		value: 'photographic',
		preview: photographicPreview,
	},
	{
		label: __( 'Digital Art', __i18n_text_domain__ ),
		value: 'digital-art',
		preview: digitalArtPreview,
	},
	{
		label: __( 'Comicbook', __i18n_text_domain__ ),
		value: 'comicbook',
		preview: comicbookPreview,
	},
	{
		label: __( 'Fantasy Art', __i18n_text_domain__ ),
		value: 'fantasy-art',
		preview: fantasyArtPreview,
	},
	{
		label: __( 'Analog Film', __i18n_text_domain__ ),
		value: 'analog-film',
		preview: analogFilmPreview,
	},
	{
		label: __( 'Neonpunk', __i18n_text_domain__ ),
		value: 'neonpunk',
		preview: neonpunkPreview,
	},
	{
		label: __( 'Isometric', __i18n_text_domain__ ),
		value: 'isometric',
		preview: isometricPreview,
	},
	{
		label: __( 'Lowpoly', __i18n_text_domain__ ),
		value: 'lowpoly',
		preview: lowpolyPreview,
	},
	{
		label: __( 'Origami', __i18n_text_domain__ ),
		value: 'origami',
		preview: origamiPreview,
	},
	{
		label: __( 'Line Art', __i18n_text_domain__ ),
		value: 'line-art',
		preview: lineArtPreview,
	},
	{
		label: __( 'Craft Clay', __i18n_text_domain__ ),
		value: 'craft-clay',
		preview: craftClayPreview,
	},
	{
		label: __( 'Cinematic', __i18n_text_domain__ ),
		value: 'cinematic',
		preview: cinematicPreview,
	},
	{
		label: __( '3D Model', __i18n_text_domain__ ),
		value: '3d-model',
		preview: threeDModelPreview,
	},
	{
		label: __( 'Pixel Art', __i18n_text_domain__ ),
		value: 'pixel-art',
		preview: pixelArtPreview,
	},
	{
		label: __( 'Texture', __i18n_text_domain__ ),
		value: 'texture',
		preview: texturePreview,
	},
];

export const VIDEO_STYLE_OPTIONS = [
	{
		label: __( 'Informative', __i18n_text_domain__ ),
		value: 'informative',
		preview: informativePreview,
	},
	{
		label: __( 'Promotional', __i18n_text_domain__ ),
		value: 'promotional',
		preview: promotionalPreview,
	},
];

export function StylePicker( { disabled = false, mode, variant = 'image' }: StylePickerProps ) {
	const isVideo = variant === 'video';
	// Video and image variants live in independent stores so the two slices
	// never collide — the video bundle's "Style" is unrelated to the image
	// bundle's "Style".
	const targetStore = isVideo ? videoStudioStore : imageStudioStore;

	const { setSelectedStyle } = useDispatch( targetStore );

	const selectedStyle = useSelect(
		( select ) => {
			return select( targetStore ).getSelectedStyle();
		},
		[ targetStore ]
	);

	const options = isVideo ? VIDEO_STYLE_OPTIONS : STYLE_OPTIONS;

	const handleStyleSelect = ( value: string ) => {
		setSelectedStyle( value );
		// Track style selection
		trackImageStudioStyleSelected( { style: value, mode } );
		// Close dropdown by triggering a mousedown event outside the InputToolbar container
		// We use requestAnimationFrame to ensure the state update completes first
		requestAnimationFrame( () => {
			// This will trigger the InputToolbar's click-outside handler to close the dropdown
			document.body.dispatchEvent(
				new MouseEvent( 'mousedown', {
					bubbles: true,
					cancelable: true,
				} )
			);
		} );
	};

	const selectedLabel =
		options.find( ( opt ) => opt.value === selectedStyle )?.label ??
		__( 'Style', __i18n_text_domain__ );

	return (
		<AgentUI.InputToolbar
			label={ selectedLabel }
			icon={ <BrushIcon size={ 16 } /> }
			className="image-studio-input-toolbar-item"
			disabled={ disabled }
		>
			<div className="image-studio-input-toolbar-dialog-grid">
				{ options.map( ( option ) => (
					<button
						key={ option.value }
						type="button"
						className={ cn( 'image-studio-input-toolbar-card', {
							'is-selected': selectedStyle === option.value,
						} ) }
						onClick={ () => handleStyleSelect( option.value ) }
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
