import { __ } from '@wordpress/i18n';
import { Notice, RouterNoticeActionLinkButton } from '../../../components/notice';

export function EmptyCartNotice( { backTo }: { backTo: string } ) {
	return (
		<div className="referral-checkout__empty">
			<Notice
				variant="info"
				title={ __( 'Your cart is empty.' ) }
				actions={
					<RouterNoticeActionLinkButton variant="solid" to={ backTo }>
						{ __( 'Back to the marketplace' ) }
					</RouterNoticeActionLinkButton>
				}
			>
				{ __( 'Add the products you want to refer, then come back to request the payment.' ) }
			</Notice>
		</div>
	);
}

/** The development site has no license to refer, or it could not be loaded. */
export function MissingSitePlanNotice( { backTo }: { backTo: string } ) {
	return (
		<div className="referral-checkout__empty">
			<Notice
				variant="error"
				title={ __( 'Failed to load the site’s plan.' ) }
				actions={
					<RouterNoticeActionLinkButton variant="solid" to={ backTo }>
						{ __( 'Back' ) }
					</RouterNoticeActionLinkButton>
				}
			>
				{ __(
					'We couldn’t find a development plan for this site to refer. Go back and try again.'
				) }
			</Notice>
		</div>
	);
}
