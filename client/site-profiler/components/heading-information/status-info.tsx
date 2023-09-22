import { CONVERSION_ACTION } from '../../hooks/use-define-conversion-action';

interface Props {
	conversionAction?: CONVERSION_ACTION;
}
export default function StatusInfo( props: Props ) {
	const { conversionAction } = props;

	switch ( conversionAction ) {
		case 'register-domain':
			return <p>Nice find! This site is available and could be yours today!</p>;
		case 'transfer-domain':
		case 'transfer-google-domain':
			return (
				<p>
					This site is hosted on <strong>WordPress.com</strong> but the domain is registered
					elsewhere.
				</p>
			);
		case 'transfer-hosting':
			return (
				<p>
					This site is using <strong>WordPress.com</strong> to manage the domain, but the site is
					hosted elsewhere.
				</p>
			);
		case 'transfer-domain-hosting':
		case 'transfer-google-domain-hosting':
			return (
				<p>
					The hosting and domain of this site are not on <strong>WordPress.com</strong>, but they
					could be!
				</p>
			);
		case 'idle':
			return (
				<p>
					Nice! This site and its domain are fully hosted on <strong>WordPress.com</strong>!
				</p>
			);
		default:
			return null;
	}
}
