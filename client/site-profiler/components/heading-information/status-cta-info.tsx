import { translate } from 'i18n-calypso';
import { CONVERSION_ACTION } from '../../hooks/use-define-conversion-action';

interface Props {
	conversionAction?: CONVERSION_ACTION;
}
export default function StatusCtaInfo( props: Props ) {
	const { conversionAction } = props;

	switch ( conversionAction ) {
		case 'register-domain':
			return (
				<p>
					{ translate(
						'Register your domain with {{strong}}WordPress.com{{/strong}} ' +
							'and benefit from one of the best platforms in the world.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'transfer-domain':
			return (
				<p>
					{ translate(
						'If you own this domain, consider transferring it to {{strong}}WordPress.com{{/strong}} ' +
							'and benefiting from the best-performing, most reliable registrar in business.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'transfer-google-domain':
		case 'transfer-google-domain-hosting':
		case 'transfer-google-domain-hosting-wp':
			return (
				<p>
					{ translate(
						'If you own this domain, consider transferring it to {{strong}}WordPress.com{{/strong}} ' +
							'to benefit from the best-performing, most reliable registrar in the business. ' +
							'And—because it’s registered with Google Domains—{{strong}}you’ll get an extra year of registration on us!{{/strong}}',
						{
							components: { br: <br />, strong: <strong /> },
						}
					) }
				</p>
			);
		case 'transfer-hosting':
		case 'transfer-hosting-wp':
			return (
				<p>
					{ translate(
						'If you own this site, consider hosting it with {{strong}}WordPress.com{{/strong}} and ' +
							'benefiting from one of the best platforms in the world.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'transfer-domain-hosting':
		case 'transfer-domain-hosting-wp':
			return (
				<p>
					{ translate(
						'If you are the owner, bring your site and domain to {{strong}}WordPress.com{{/strong}} ' +
							'and benefit from one of the best hosting platforms in the world.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		default:
			return null;
	}
}
