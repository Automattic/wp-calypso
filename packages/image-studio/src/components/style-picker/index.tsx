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
import videoCinematicPreview from '../../assets/video/styles/cinematic.webp';
import videoHighlightsSoonPreview from '../../assets/video/styles/highlights-soon.webp';
import videoHighlightsPreview from '../../assets/video/styles/highlights.webp';
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

interface StyleOption {
	label: string;
	value: string;
	preview: string;
	// One-line explainer rendered under the label. Video styles use it;
	// image styles are self-explanatory by name and omit it.
	description?: string;
	// Renders the card with the native disabled attribute + a greyed-out
	// .is-disabled style — used to tease an upcoming style.
	disabled?: boolean;
}

export const STYLE_OPTIONS: StyleOption[] = [
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

// The prior Informative / Promotional video styles collapse into one
// "Cinematic" preset — they were the same Veo chain with cosmetically
// different prompt templates, which never read as meaningfully distinct.
// "Highlights" is server-rendered via EditFrame Cloud on this branch
// (LLM-composed HTML → EditFrame /api/v1/renders → MP4 → media library);
// the in-browser encoding implementation lives on the older compositor
// branches and is preserved there.
//
// Production default ships Cinematic-only; Highlights is disabled with a
// "coming soon" preview. The StylePicker component swaps in the live
// preview and enables the card when window.imageStudioData.isDevMode is
// true (a12s testing).
export const VIDEO_STYLE_OPTIONS: StyleOption[] = [
	{
		label: __( 'Cinematic', __i18n_text_domain__ ),
		value: 'cinematic',
		preview: videoCinematicPreview,
		description: __( 'Create an 8-second b-roll mood clip from a prompt.', __i18n_text_domain__ ),
	},
	{
		label: __( 'Highlights (Coming Soon)', __i18n_text_domain__ ),
		value: 'highlights',
		preview: videoHighlightsSoonPreview,
		description: __(
			"Build a 20-second recap clip using your post's images and key points.",
			__i18n_text_domain__
		),
		disabled: true,
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

	// Dev-mode override: unlock Highlights, swap to the live preview, and
	// flip the label to "(a12s only)". Production default keeps the
	// "Coming Soon" label + teaser preview + disabled state while we
	// launch Cinematic-only.
	const isDevMode = typeof window !== 'undefined' && window.imageStudioData?.isDevMode === true;
	const options = isVideo
		? VIDEO_STYLE_OPTIONS.map( ( opt ) =>
				opt.value === 'highlights' && isDevMode
					? {
							...opt,
							label: __( 'Highlights (a12s only)', __i18n_text_domain__ ),
							preview: videoHighlightsPreview,
							disabled: false,
					  }
					: opt
		  )
		: STYLE_OPTIONS;

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
						disabled={ option.disabled }
						className={ cn( 'image-studio-input-toolbar-card', {
							'is-selected': selectedStyle === option.value,
							'is-disabled': option.disabled,
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
						{ option.description ? (
							<span className="image-studio-input-toolbar-card__description">
								{ option.description }
							</span>
						) : null }
					</button>
				) ) }
			</div>
		</AgentUI.InputToolbar>
	);
}
