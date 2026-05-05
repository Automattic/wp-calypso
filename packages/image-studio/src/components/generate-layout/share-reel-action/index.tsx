import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SocialLogo } from 'social-logos';
import { useReelShare } from '../../../hooks/use-reel-share';
import './style.scss';

export function ShareReelAction(): JSX.Element | null {
	const { isVisible, isSharing, handleShare } = useReelShare();

	if ( ! isVisible ) {
		return null;
	}

	const label = isSharing
		? __( 'Sharing to Instagram…', __i18n_text_domain__ )
		: __( 'Share as Instagram Reel', __i18n_text_domain__ );

	return (
		<div className="image-studio-share-reel-action">
			<Button
				className="image-studio-share-reel-action__button"
				icon={ <SocialLogo icon="instagram" size={ 18 } /> }
				label={ label }
				showTooltip
				disabled={ isSharing }
				isBusy={ isSharing }
				onClick={ handleShare }
			/>
		</div>
	);
}
