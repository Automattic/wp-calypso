import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { type ImageStudioActions, store as imageStudioStore } from '../../store';
import { StudioMode } from '../../types';
import './style.scss';

export const StudioModeToggle = () => {
	const studioMode = useSelect(
		( select ) =>
			(
				select( imageStudioStore ) as unknown as { getStudioMode?: () => StudioMode }
			 ).getStudioMode?.() ?? StudioMode.Image,
		[]
	);

	const { setStudioMode } = useDispatch( imageStudioStore ) as ImageStudioActions;

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
				onClick={ () => setStudioMode( StudioMode.Image ) }
			>
				{ __( 'Image', __i18n_text_domain__ ) }
			</Button>
			<Button
				variant="tertiary"
				className="image-studio-mode-toggle__button"
				isPressed={ studioMode === StudioMode.Video }
				aria-pressed={ studioMode === StudioMode.Video }
				onClick={ () => setStudioMode( StudioMode.Video ) }
			>
				{ __( 'Video', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
};
