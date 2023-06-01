import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';

type CommissionFeesProps = {
	className?: string;
	commission: number;
};

const CommissionFees = ( { commission, className }: CommissionFeesProps ) => {
	const translate = useTranslate();

	return (
		commission !== null && (
			<div className={ className }>
				{ translate(
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
									iconSize={ 16 }
								/>
							),
						},
					}
				) }
			</div>
		)
	);
};

export default CommissionFees;
