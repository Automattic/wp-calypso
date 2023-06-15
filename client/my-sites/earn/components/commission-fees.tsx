import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';
import { preventWidows } from 'calypso/lib/formatting';

type CommissionFeesProps = {
	className?: string;
	commission: number | null;
	iconSize?: number;
};

const CommissionFees = ( { className, commission, iconSize = 16 }: CommissionFeesProps ) => {
	const translate = useTranslate();

	return commission !== null ? (
		<span className={ className }>
			{ preventWidows(
				translate(
					'On your current plan, WordPress.com charges {{em}}%(commission)s{{/em}}.{{br/}} Additionally, Stripe charges are typically %(stripe)s. {{a}}Learn more{{/a}}',
					{
						args: {
							commission: '' + parseFloat( String( commission ) ) * 100 + '%',
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
	) : null;
};

export default CommissionFees;
