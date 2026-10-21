import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import Notice from '../../components/notice';

/**
 * Dismissible success notice shown on the purchases list after a remove.
 * Driven by `?removed` and `?removedDomain` URL search params set by the
 * cancel-purchase remove flow. The caller handles reading + stripping the
 * params and controlling visibility via `onClose`.
 */
export function PurchaseRemovedNotice( {
	productNoun,
	atomicDomain,
	onClose,
}: {
	productNoun: string;
	atomicDomain?: string;
	onClose: () => void;
} ) {
	if ( atomicDomain ) {
		const exportUrl = `https://${ atomicDomain }/wp-admin/export.php`;
		return (
			<Notice
				variant="success"
				onClose={ onClose }
				actions={
					<Button variant="primary" href={ exportUrl } target="_blank" rel="noreferrer">
						{ __( 'Download backup' ) }
					</Button>
				}
			>
				{ sprintf(
					/* translators: %(productNoun)s is plan/domain/email/theme/plugin/subscription. */
					__(
						'Your %(productNoun)s has been removed. Your site will revert to its previous state \u2014 download a backup to save your content, themes, and plugins. You\u2019ll receive a confirmation email shortly.'
					),
					{ productNoun }
				) }
			</Notice>
		);
	}

	return (
		<Notice variant="success" onClose={ onClose }>
			{ sprintf(
				/* translators: %(productNoun)s is plan/domain/email/theme/plugin/subscription. */
				__(
					'Your %(productNoun)s has been removed. You\u2019ll receive a confirmation email shortly.'
				),
				{ productNoun }
			) }
		</Notice>
	);
}
