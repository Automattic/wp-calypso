import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { preventWidows } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type CommissionFeesProps = {
	className?: string;
	commission: number | null;
	iconSize?: number;
	siteSlug?: string | null;
	isPlan100YearPlan?: boolean;
};

const CommissionFees = ( {
	className,
	commission,
	iconSize = 16,
	siteSlug,
	isPlan100YearPlan,
}: CommissionFeesProps ) => {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, site?.ID ) );
	const isAtomicSite = useSelector( ( state ) => isSiteAutomatedTransfer( state, site?.ID ) );

	if ( commission === null ) {
		return null;
	}

	const isJetpackNotAtomic = isJetpack && ! isAtomicSite;

	const upgradeLinkHost = isJetpackNotAtomic
		? 'https://jetpack.com/creator/#pricing'
		: `https://wordpress.com/plans/${ siteSlug ? siteSlug : '' }`;

	const upgradeLink =
		commission === 0 || isPlan100YearPlan ? null : (
			<>
				{ ' ' }
				<a href={ upgradeLinkHost }>
					{ /* translators: 'Upgrade to a paid plan to lower transaction fee % for payment features. */ }
					{ translate( 'Upgrade to lower it.' ) }
				</a>
			</>
		);

	return (
		<span className={ className }>
			{ preventWidows(
				<>
					{ translate(
						'With your current plan, the transaction fee for payments is %(commissionFee)d% (+ {{link}}Stripe fees{{/link}}).',
						{
							args: {
								commissionFee: commission * 100,
							},
							components: {
								link: <ExternalLink href="https://stripe.com/pricing" icon iconSize={ iconSize } />,
							},
						}
					) }
					{ upgradeLink }
				</>
			) }
		</span>
	);
};

export default CommissionFees;
