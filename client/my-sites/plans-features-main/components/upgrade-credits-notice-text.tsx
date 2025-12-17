import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import type { UpgradeCreditsNoticeSource } from 'calypso/my-sites/plans-features-main/hooks/use-upgrade-credits-notice';

type Props = {
	variant: 'compact' | 'full';
	amountInCurrency: string;
	source?: UpgradeCreditsNoticeSource | null;
};

export default function UpgradeCreditsNoticeText( { variant, amountInCurrency, source }: Props ) {
	const translate = useTranslate();

	if ( variant === 'compact' ) {
		return translate( 'You have %(amountInCurrency)s in upgrade credits available', {
			args: { amountInCurrency },
		} );
	}

	const supportLink = (
		<InlineSupportLink supportContext="plans-upgrade-credit" showIcon={ false } />
	);

	switch ( source ) {
		case 'plan':
			return translate(
				'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current plan. This credit will be applied at checkout if you upgrade today!',
				{
					args: { amountInCurrency },
					components: { b: <strong />, a: supportLink },
				}
			);
		case 'domain-and-other-upgrades':
			return translate(
				'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current domain and other upgrades. This credit will be applied at checkout if you purchase a plan today!',
				{
					args: { amountInCurrency },
					components: { b: <strong />, a: supportLink },
				}
			);
		case 'domain':
			return translate(
				'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current domain. This credit will be applied at checkout if you purchase a plan today!',
				{
					args: { amountInCurrency },
					components: { b: <strong />, a: supportLink },
				}
			);
		case 'other-upgrades':
		default:
			return translate(
				'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from other upgrades. This credit will be applied at checkout if you purchase a plan today!',
				{
					args: { amountInCurrency },
					components: { b: <strong />, a: supportLink },
				}
			);
	}
}
