import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { share } from '@wordpress/icons';
import { SocialLogo } from 'social-logos';
import { useGenericShare } from '../../../hooks/use-generic-share';
import { useReelShare } from '../../../hooks/use-reel-share';
import { ConfirmationDialog } from '../../confirmation-dialog';
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

	const confirmBody = reel.igDisplayName
		? createInterpolateElement(
				__( 'This Reel will be published to <account /> on Instagram.', __i18n_text_domain__ ),
				{ account: <strong>{ reel.igDisplayName }</strong> }
		  )
		: __(
				'This Reel will be published to your connected Instagram account.',
				__i18n_text_domain__
		  );

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
			<ConfirmationDialog
				isOpen={ reel.isConfirming }
				title={ __( 'Share to Instagram?', __i18n_text_domain__ ) }
				actions={ [
					{
						text: __( 'Cancel', __i18n_text_domain__ ),
						onClick: reel.cancelShare,
						variant: 'tertiary',
					},
					{
						text: __( 'Share', __i18n_text_domain__ ),
						onClick: reel.confirmShare,
						variant: 'primary',
					},
				] }
				onClose={ reel.cancelShare }
			>
				{ confirmBody }
			</ConfirmationDialog>
		</div>
	);
}
