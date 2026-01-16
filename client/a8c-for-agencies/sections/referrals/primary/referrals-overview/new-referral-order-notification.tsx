import { Button } from '@wordpress/components';
import { customLink } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';

type Props = {
	referralOrderEmail: string;
	referralOrderCheckoutUrl: string;
	onClose?: () => void;
	isFullWidth?: boolean;
	flowType: 'send' | 'copy';
};

export default function NewReferralOrderNotification( {
	referralOrderEmail,
	referralOrderCheckoutUrl,
	onClose,
	isFullWidth,
	flowType,
}: Props ) {
	const [ showBanner, setShowBanner ] = useState( true );

	const translate = useTranslate();
	const dispatch = useDispatch();

	const onCloseClick = () => {
		setShowBanner( false );
		onClose?.();
	};

	const onCopyLinkClick = () => {
		navigator.clipboard.writeText( referralOrderCheckoutUrl );

		dispatch( recordTracksEvent( 'calypso_a4a_referrals_notification_copy_link_button_click' ) );
		navigator.clipboard
			.writeText( referralOrderCheckoutUrl )
			.then( () => {
				dispatch(
					successNotice( translate( 'Link has been copied to clipboard' ), {
						id: 'copy-referral-link-success',
						duration: 3000,
					} )
				);
			} )
			.catch( () => {
				dispatch(
					errorNotice( translate( "Couldn't copy link to clipboard" ), {
						id: 'copy-referral-link-error',
						duration: 5000,
					} )
				);
			} );
	};

	return (
		showBanner && (
			<LayoutBanner
				isFullWidth={ isFullWidth }
				level="success"
				onClose={ onCloseClick }
				title={
					( flowType === 'send'
						? translate( 'Referral sent to %(referralEmail)s', {
								args: { referralEmail: referralOrderEmail },
						  } )
						: translate( 'The referral link has been copied to your clipboard!' ) ) as string
				}
			>
				<div className="new-referral-order-notification">
					<ul>
						<li>
							{ translate(
								'This link is {{b}}valid for 14 days{{/b}}. Please ensure your client makes this purchase before it expires.',
								{
									components: {
										b: <b />,
									},
								}
							) }
						</li>
						<li>
							{ translate(
								'During checkout, your client will create a WordPress.com account and will be emailed a receipt.'
							) }
						</li>
						<li>
							{ translate(
								'After purchase, you can immediately set up the hosting or any products referred.'
							) }
						</li>
					</ul>

					<Button
						variant="secondary"
						onClick={ onCopyLinkClick }
						icon={ customLink }
						iconPosition="left"
					>
						{ flowType === 'send' ? translate( 'Copy link' ) : translate( 'Copy link again' ) }
					</Button>
				</div>
			</LayoutBanner>
		)
	);
}
