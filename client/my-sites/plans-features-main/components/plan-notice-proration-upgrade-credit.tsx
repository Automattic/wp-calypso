import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Notice from 'calypso/components/notice';
import { useProrationUpgradeCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-proration-upgrade-credits-applicable';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import type { PlanSlug } from '@automattic/calypso-products';

type Props = {
	className?: string;
	onDismissClick?: () => void;
	siteId: number;
	visiblePlans?: PlanSlug[];
};

const PlanNoticeProrationUpgradeCredit = ( {
	className,
	onDismissClick,
	siteId,
	visiblePlans,
}: Props ) => {
	const prorationCreditsApplicable = useProrationUpgradeCreditsApplicable( siteId, visiblePlans );
	const credits = prorationCreditsApplicable?.credits ?? 0;
	const showNotice = prorationCreditsApplicable !== null && credits > 0;
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const amountInCurrency = formatCurrency( credits, currencyCode ?? '', { isSmallestUnit: true } );

	const noticeText = () => {
		if (
			prorationCreditsApplicable?.hasDomainProration &&
			prorationCreditsApplicable?.hasOtherUpgradeProration
		) {
			return translate(
				'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current domain and other upgrades. This credit will be applied to the pricing below at checkout if you purchase a plan today!',
				{
					args: { amountInCurrency },
					components: {
						b: <strong />,
						a: <InlineSupportLink supportContext="plans-upgrade-credit" showIcon={ false } />,
					},
				}
			);
		}

		if ( prorationCreditsApplicable?.hasDomainProration ) {
			return translate(
				'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current domain. This credit will be applied to the pricing below at checkout if you purchase a plan today!',
				{
					args: { amountInCurrency },
					components: {
						b: <strong />,
						a: <InlineSupportLink supportContext="plans-upgrade-credit" showIcon={ false } />,
					},
				}
			);
		}

		return translate(
			'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from other upgrades. This credit will be applied to the pricing below at checkout if you purchase a plan today!',
			{
				args: { amountInCurrency },
				components: {
					b: <strong />,
					a: <InlineSupportLink supportContext="plans-upgrade-credit" showIcon={ false } />,
				},
			}
		);
	};

	return (
		<>
			<QuerySitePlans siteId={ siteId } />
			{ showNotice && (
				<Notice
					className={ className }
					showDismiss={ !! onDismissClick }
					onDismissClick={ onDismissClick }
					icon="info-outline"
					status="is-success"
					theme="light"
				>
					{ noticeText() }
				</Notice>
			) }
		</>
	);
};

export default PlanNoticeProrationUpgradeCredit;
