import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { share } from '@wordpress/icons';
import { SocialLogo } from 'social-logos';
import { useGenericShare } from '../../../hooks/use-generic-share';
import { useReelShare } from '../../../hooks/use-reel-share';
import { ReelShareConfirmationDialog } from '../../reel-share-confirmation-dialog';
import './style.scss';

export function ShareReelAction(): JSX.Element | null {
	const reel = useReelShare();
	const generic = useGenericShare();

	if ( ! reel.isVisible && ! generic.isVisible ) {
		return null;
	}

	const reelAriaLabel = reel.isSharing
		? __( 'Sharing on Instagram…', __i18n_text_domain__ )
		: __( 'Share on Instagram', __i18n_text_domain__ );

	const genericAriaLabel = generic.isSharing
		? __( 'Sharing to other apps…', __i18n_text_domain__ )
		: __( 'Share to other apps', __i18n_text_domain__ );

	return (
		<div
			className="image-studio-share-reel-action"
			role="group"
			aria-label={ __( 'Share generated video', __i18n_text_domain__ ) }
		>
			{ generic.isVisible && (
				<Button
					className="image-studio-share-reel-action__button"
					icon={ share }
					label={ genericAriaLabel }
					showTooltip
					disabled={ generic.isSharing }
					isBusy={ generic.isSharing }
					onClick={ generic.handleShare }
				/>
			) }
			{ reel.isVisible && (
				<Button
					className="image-studio-share-reel-action__button"
					icon={ <SocialLogo icon="instagram" size={ 18 } /> }
					label={ reelAriaLabel }
					showTooltip
					disabled={ reel.isSharing }
					isBusy={ reel.isSharing }
					onClick={ reel.requestShare }
				/>
			) }
			<ReelShareConfirmationDialog
				isOpen={ reel.isConfirming }
				igDisplayName={ reel.igDisplayName }
				onConfirm={ reel.confirmShare }
				onCancel={ reel.cancelShare }
			/>
		</div>
	);
}
