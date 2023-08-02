import { useTranslate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';
import { preventWidows } from 'calypso/lib/formatting';

type CommissionFeesProps = {
	className?: string;
	commission: number | null;
	iconSize?: number;
	siteSlug?: string | null;
};

const CommissionFees = ( {
	className,
	commission,
	iconSize = 16,
	siteSlug,
}: CommissionFeesProps ) => {
	const translate = useTranslate();

	if ( commission === null ) {
		return null;
	}

	const upgradeLink =
		commission === 0 ? null : (
			<>
				{ ' ' }
				<a href={ siteSlug ? `/plans/${ siteSlug }` : '/plans' }>
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
								link: (
									<ExternalLink
										href="https://stripe.com/pricing"
										icon={ true }
										iconSize={ iconSize }
									/>
								),
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
