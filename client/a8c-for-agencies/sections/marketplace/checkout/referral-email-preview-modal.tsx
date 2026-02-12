import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import Dialog from 'calypso/components/dialog';

interface ReferralEmailPreviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	logoUrl: string | null;
	clientEmail: string;
	customMessage: string;
	productNames: string[];
}

function ReferralEmailPreviewModal( {
	isOpen,
	onClose,
	logoUrl,
	clientEmail,
	customMessage,
	productNames,
}: ReferralEmailPreviewModalProps ) {
	const translate = useTranslate();
	const agency = useSelector( getActiveAgency );

	const agencyName = agency?.name || 'Your Agency';

	const handleClose = useCallback( () => {
		onClose();
	}, [ onClose ] );

	return (
		<Dialog
			isVisible={ isOpen }
			onClose={ handleClose }
			className="referral-email-preview-modal"
			buttons={ [
				<Button key="close" variant="primary" onClick={ handleClose }>
					{ translate( 'Close' ) }
				</Button>,
			] }
		>
			<div className="referral-email-preview-modal__content">
				<h2 className="referral-email-preview-modal__title">
					{ translate( 'Email Preview' ) }
				</h2>
				<p className="referral-email-preview-modal__subtitle">
					{ translate( 'This is what your client will receive:' ) }
				</p>

				<div className="referral-email-preview-modal__email">
					<div className="referral-email-preview-modal__email-header">
						<div className="referral-email-preview-modal__email-from">
							<strong>{ translate( 'From:' ) }</strong> { agencyName } via Automattic for Agencies
						</div>
						<div className="referral-email-preview-modal__email-to">
							<strong>{ translate( 'To:' ) }</strong> { clientEmail }
						</div>
						<div className="referral-email-preview-modal__email-subject">
							<strong>{ translate( 'Subject:' ) }</strong> { agencyName }{ ' ' }
							{ translate( 'sent you a referral' ) }
						</div>
					</div>

					<div className="referral-email-preview-modal__email-body">
						{ logoUrl && (
							<div className="referral-email-preview-modal__email-logo">
								<img src={ logoUrl } alt={ agencyName } />
							</div>
						) }

						<div className="referral-email-preview-modal__email-greeting">
							{ translate( 'Hi,' ) }
						</div>

						<div className="referral-email-preview-modal__email-intro">
							<strong>{ agencyName }</strong> { translate( 'has referred you to' ) }{ ' ' }
							<strong>Automattic for Agencies</strong>{ ' ' }
							{ translate( 'for the following products:' ) }
						</div>

						<ul className="referral-email-preview-modal__email-products">
							{ productNames.map( ( productName, index ) => (
								<li key={ index }>{ productName }</li>
							) ) }
						</ul>

						{ customMessage && (
							<div className="referral-email-preview-modal__email-message">
								<div className="referral-email-preview-modal__email-message-label">
									<strong>{ translate( 'Personal message from' ) } { agencyName }:</strong>
								</div>
								<div className="referral-email-preview-modal__email-message-content">
									{ customMessage }
								</div>
							</div>
						) }

						<div className="referral-email-preview-modal__email-cta">
							<Button variant="primary">{ translate( 'View referral and complete payment' ) }</Button>
						</div>

						<div className="referral-email-preview-modal__email-footer">
							{ translate(
								'This email was sent by {{agency}} through Automattic for Agencies. If you have questions, please contact {{agency}} directly.',
								{
									args: {
										agency: agencyName,
									},
								}
							) }
						</div>
					</div>
				</div>
			</div>
		</Dialog>
	);
}

export default ReferralEmailPreviewModal;
