import { translate } from 'i18n-calypso';
import { CONVERSION_ACTION } from '../../hooks/use-define-conversion-action';

interface Props {
	conversionAction?: CONVERSION_ACTION;
}
export default function StatusInfo( props: Props ) {
	const { conversionAction } = props;

	switch ( conversionAction ) {
		case 'register-domain':
			return <p>{ translate( 'Nice find! This site is available and could be yours today!' ) }</p>;
		case 'transfer-domain':
		case 'transfer-google-domain':
			return (
				<p>
					{ translate(
						'This site is hosted on {{strong}}WordPress.com{{/strong}} but the domain is registered elsewhere.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'transfer-hosting':
			return (
				<p>
					{ translate(
						'This site is using {{strong}}WordPress.com{{/strong}} to manage the domain, but the site is hosted elsewhere.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'transfer-domain-hosting':
		case 'transfer-google-domain-hosting':
			return (
				<p>
					{ translate(
						'The hosting and domain of this site are not on {{strong}}WordPress.com{{/strong}}, but they could be!',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'idle':
			return (
				<p>
					{ translate(
						'Nice! This site and its domain are fully hosted on {{strong}}WordPress.com{{/strong}}!',
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
