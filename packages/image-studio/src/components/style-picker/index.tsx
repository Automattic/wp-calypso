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
import vividPreview from '../../assets/vivid.webp';
import { store as imageStudioStore } from '../../store';
import { BrushIcon } from '../icons/BrushIcon';

interface StylePickerProps {
	disabled?: boolean;
}

export const STYLE_OPTIONS = [
	{ label: __( 'Select style', 'big-sky' ), value: 'none', preview: null },
	{ label: __( 'None', 'big-sky' ), value: '', preview: nonePreview },
	{
		label: __( 'Vivid', 'big-sky' ),
		value: 'vivid',
		preview: vividPreview,
	},
	{ label: __( 'Anime', 'big-sky' ), value: 'anime', preview: animePreview },
	{
		label: __( 'Photographic', 'big-sky' ),
		value: 'photographic',
		preview: photographicPreview,
	},
	{
		label: __( 'Digital Art', 'big-sky' ),
		value: 'digital-art',
		preview: digitalArtPreview,
	},
	{
		label: __( 'Comicbook', 'big-sky' ),
		value: 'comicbook',
		preview: comicbookPreview,
	},
	{
		label: __( 'Fantasy Art', 'big-sky' ),
		value: 'fantasy-art',
		preview: fantasyArtPreview,
	},
	{
		label: __( 'Analog Film', 'big-sky' ),
		value: 'analog-film',
		preview: analogFilmPreview,
	},
	{
		label: __( 'Neonpunk', 'big-sky' ),
		value: 'neonpunk',
		preview: neonpunkPreview,
	},
	{
		label: __( 'Isometric', 'big-sky' ),
		value: 'isometric',
		preview: isometricPreview,
	},
	{
		label: __( 'Lowpoly', 'big-sky' ),
		value: 'lowpoly',
		preview: lowpolyPreview,
	},
	{
		label: __( 'Origami', 'big-sky' ),
		value: 'origami',
		preview: origamiPreview,
	},
	{
		label: __( 'Line Art', 'big-sky' ),
		value: 'line-art',
		preview: lineArtPreview,
	},
	{
		label: __( 'Craft Clay', 'big-sky' ),
		value: 'craft-clay',
		preview: craftClayPreview,
	},
	{
		label: __( 'Cinematic', 'big-sky' ),
		value: 'cinematic',
		preview: cinematicPreview,
	},
	{
		label: __( '3D Model', 'big-sky' ),
		value: '3d-model',
		preview: threeDModelPreview,
	},
	{
		label: __( 'Pixel Art', 'big-sky' ),
		value: 'pixel-art',
		preview: pixelArtPreview,
	},
	{
		label: __( 'Texture', 'big-sky' ),
		value: 'texture',
		preview: texturePreview,
	},
];

export function StylePicker( { disabled = false }: StylePickerProps ) {
	const { setSelectedStyle } = useDispatch( imageStudioStore );

	const selectedStyle = useSelect( ( select ) => {
		return select( imageStudioStore ).getSelectedStyle();
	}, [] );

	const handleStyleSelect = ( value: string ) => {
		setSelectedStyle( value );
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
		STYLE_OPTIONS.find( ( opt ) => opt.value === selectedStyle )?.label ??
		__( 'Styles', 'big-sky' );

	return (
		<AgentUI.InputToolbar
			label={ selectedLabel }
			icon={ <BrushIcon size={ 16 } /> }
			className="image-studio-input-toolbar-item"
			disabled={ disabled }
		>
			<div className="image-studio-input-toolbar-dialog-grid">
				{ STYLE_OPTIONS.filter( ( opt ) => opt.preview ).map( ( option ) => (
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
