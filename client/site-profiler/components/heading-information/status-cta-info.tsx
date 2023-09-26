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
							'and benefit from one of the best hosting platforms in the world.',
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
						'If you own this domain, transfer it to {{strong}}WordPress.com{{/strong}} ' +
							'and benefit from the best-performing, most reliable registrar in the business.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'transfer-google-domain':
		case 'transfer-google-domain-hosting':
			return (
				<p>
					{ translate(
						'If you own this domain, transfer it to {{strong}}WordPress.com{{/strong}} ' +
							'and benefit from the best-performing, most reliable registrar in the business.' +
							'{{br/}}And because it’s registered with Google Domains ' +
							'{{strong}}we’ll pay for an extra year of registration{{/strong}} when you transfer it.',
						{
							components: { br: <br />, strong: <strong /> },
						}
					) }
				</p>
			);
		case 'transfer-hosting':
			return (
				<p>
					{ translate(
						'If you own this site, host it with {{strong}}WordPress.com{{/strong}} and ' +
							'benefit from one of the best hosting platforms in the world.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'transfer-domain-hosting':
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
