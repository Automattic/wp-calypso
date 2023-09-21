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
					Register your domain with <strong>WordPress.com</strong> and benefit from one of the best
					hosting platforms in the world.
				</p>
			);
		case 'transfer-domain':
			return (
				<p>
					If you own this domain, transfer it to <strong>WordPress.com</strong> and benefit from the
					best-performing, most reliable registrar in the business.
				</p>
			);
		case 'transfer-google-domain':
			return (
				<p>
					If you own this domain, transfer it to <strong>WordPress.com</strong> and benefit from the
					best-performing, most reliable registrar in the business.
					<br />
					And because it’s registered with Google Domains{ ' ' }
					<strong>we’ll pay for an extra year of registration</strong> when you transfer it.
				</p>
			);
		case 'transfer-hosting':
			return (
				<p>
					If you own this site, host it with <strong>WordPress.com</strong> and benefit from one of
					the best hosting platforms in the world.
				</p>
			);
		case 'transfer-domain-hosting':
			return (
				<p>
					If you are the owner, bring your site and domain to <strong>WordPress.com</strong> and
					benefit from one of the best hosting platforms in the world.{ ' ' }
				</p>
			);
		default:
			return null;
	}
}
