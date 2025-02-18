import { formatCurrency } from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';

type Props = {
	amount: number;
};

const DomainToPlanCreditMessage = ( { amount }: Props ) => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const translate = useTranslate();
	const upgradeCreditDocsUrl = localizeUrl(
		'https://wordpress.com/support/manage-purchases/upgrade-your-plan/#upgrade-credit'
	);

	return translate(
		'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current domain. This credit will be applied to the pricing below at checkout if you purchase a plan today!',
		{
			args: {
				amountInCurrency: formatCurrency( amount, currencyCode ?? '', {
					isSmallestUnit: true,
				} ),
			},
			components: {
				b: <strong />,
				a: <InlineSupportLink supportLink={ upgradeCreditDocsUrl } />,
			},
		}
	);
};

export default DomainToPlanCreditMessage;
