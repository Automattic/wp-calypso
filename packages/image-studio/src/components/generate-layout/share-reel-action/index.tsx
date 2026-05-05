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

	const ariaLabel = isSharing
		? __( 'Sharing on Instagram…', __i18n_text_domain__ )
		: __( 'Share on Instagram', __i18n_text_domain__ );

	const visibleText = isSharing
		? __( 'Sharing…', __i18n_text_domain__ )
		: __( 'Share:', __i18n_text_domain__ );

	return (
		<div className="image-studio-share-reel-action">
			<Button
				className="image-studio-share-reel-action__button"
				aria-label={ ariaLabel }
				disabled={ isSharing }
				isBusy={ isSharing }
				onClick={ handleShare }
			>
				<span className="image-studio-share-reel-action__label">{ visibleText }</span>
				<span className="image-studio-share-reel-action__icon">
					<SocialLogo icon="instagram" size={ 18 } />
				</span>
			</Button>
		</div>
	);
}
