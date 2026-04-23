import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { type ImageStudioActions, store as imageStudioStore } from '../../store';
import { StudioMode } from '../../types';
import { VIDEO_STYLE_OPTIONS } from '../style-picker';
import './style.scss';

const DEFAULT_VIDEO_STYLE = 'informative';

export const StudioModeToggle = () => {
	const studioMode = useSelect(
		( select ) =>
			(
				select( imageStudioStore ) as unknown as { getStudioMode?: () => StudioMode }
			 ).getStudioMode?.() ?? StudioMode.Image,
		[]
	);

	const selectedStyle = useSelect(
		( select ) => select( imageStudioStore ).getSelectedStyle() as string | null,
		[]
	);

	const { setStudioMode, setSelectedStyle } = useDispatch( imageStudioStore ) as ImageStudioActions;

	const handleSelect = ( nextMode: StudioMode ) => {
		if ( nextMode === StudioMode.Video ) {
			const isValidVideoStyle = VIDEO_STYLE_OPTIONS.some( ( opt ) => opt.value === selectedStyle );
			if ( ! isValidVideoStyle ) {
				setSelectedStyle( DEFAULT_VIDEO_STYLE );
			}
		}
		setStudioMode( nextMode );
	};

	return (
		<div
			className="image-studio-mode-toggle"
			role="group"
			aria-label={ __( 'Studio mode', __i18n_text_domain__ ) }
		>
			<Button
				variant="tertiary"
				className="image-studio-mode-toggle__button"
				isPressed={ studioMode === StudioMode.Image }
				aria-pressed={ studioMode === StudioMode.Image }
				onClick={ () => handleSelect( StudioMode.Image ) }
			>
				{ __( 'Image', __i18n_text_domain__ ) }
			</Button>
			<Button
				variant="tertiary"
				className="image-studio-mode-toggle__button"
				isPressed={ studioMode === StudioMode.Video }
				aria-pressed={ studioMode === StudioMode.Video }
				onClick={ () => handleSelect( StudioMode.Video ) }
			>
				{ __( 'Video', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
};
