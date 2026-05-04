import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useReelShare } from '../../../hooks/use-reel-share';
import './style.scss';

export function ShareReelAction(): JSX.Element | null {
	const { isVisible, isSharing, handleShare } = useReelShare();

	if ( ! isVisible ) {
		return null;
	}

	return (
		<div className="image-studio-share-reel-action">
			<Button
				variant="primary"
				className="image-studio-share-reel-action__button"
				__next40pxDefaultSize
				disabled={ isSharing }
				isBusy={ isSharing }
				onClick={ handleShare }
			>
				{ isSharing
					? __( 'Sharing to Instagram…', __i18n_text_domain__ )
					: __( 'Share as Instagram Reel', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
}
