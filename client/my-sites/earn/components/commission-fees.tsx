import { englishLocales, localizeUrl, useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
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
	const { hasTranslation } = useI18n();
	const locale = useLocale();

	if ( commission === null ) {
		return null;
	}

	const useNewStrings =
		englishLocales.includes( locale ) ||
		( hasTranslation(
			'With your current plan, the transaction fee for payments is %(commissionFee)d% (+ {{link}}Stripe fees{{/link}}).'
		) &&
			hasTranslation( 'Upgrade to lower it.' ) );

	if ( useNewStrings ) {
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
	}

	// Old strings, remove once above has been translated
	return (
		<span className={ className }>
			{ preventWidows(
				translate(
					'On your current plan, WordPress.com charges {{em}}%(commission)s{{/em}}.{{br/}} Additionally, Stripe charges are typically %(stripe)s. {{a}}Learn more{{/a}}',
					{
						args: {
							commission: '' + parseFloat( commission ) * 100 + '%',
							stripe: '2.9%+30c',
						},
						components: {
							em: <em />,
							br: <br />,
							a: (
								<ExternalLink
									href={ localizeUrl(
										'https://wordpress.com/support/wordpress-editor/blocks/payments/#related-fees'
									) }
									icon={ true }
									iconSize={ iconSize }
								/>
							),
						},
					}
				)
			) }
		</span>
	);
};

export default CommissionFees;
