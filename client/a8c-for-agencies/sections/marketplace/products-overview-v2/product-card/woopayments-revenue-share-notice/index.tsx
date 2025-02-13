import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

export default function WooPaymentsRevenueShareNotice() {
	const translate = useTranslate();

	return (
		<div className="product-card__revenue-share-notice">
			<Icon icon={ info } size={ 24 } />
			<span>
				{ translate(
					'Only sites that have the {{a}}Automattic for Agencies{{/a}} plugin installed and connected are eligible for revenue share with WooPayments.',
					{
						components: {
							a: (
								<a
									href="https://agencieshelp.automattic.com/knowledge-base/the-automattic-for-agencies-client-plugin/"
									target="_blank"
									rel="noopener noreferrer"
								>
									A4A
								</a>
							),
						},
					}
				) }
			</span>
		</div>
	);
}
