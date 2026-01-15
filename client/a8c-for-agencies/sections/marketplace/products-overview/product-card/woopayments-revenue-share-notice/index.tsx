import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';

import './style.scss';

export default function WooPaymentsRevenueShareNotice() {
	const translate = useTranslate();
	const { showSupportGuide } = useHelpCenter();

	return (
		<div className="product-card__revenue-share-notice">
			<Icon icon={ info } size={ 24 } />
			<span>
				{ translate(
					'Only sites that have the {{a}}Automattic for Agencies{{/a}} plugin installed and connected are eligible for revenue share with WooPayments.',
					{
						components: {
							a: (
								// eslint-disable-next-line jsx-a11y/anchor-is-valid
								<a
									onClick={ () =>
										showSupportGuide(
											'https://agencieshelp.automattic.com/knowledge-base/the-automattic-for-agencies-client-plugin/'
										)
									}
									href="#"
								/>
							),
						},
					}
				) }
			</span>
		</div>
	);
}
