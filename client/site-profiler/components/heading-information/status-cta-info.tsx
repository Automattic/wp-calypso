import { translate } from 'i18n-calypso';
import { CONVERSION_ACTION } from '../../hooks/use-define-conversion-action';
import type { SPECIAL_DOMAIN_CATEGORY } from '../../utils/get-domain-category';

interface Props {
	conversionAction?: CONVERSION_ACTION;
	domainCategory?: SPECIAL_DOMAIN_CATEGORY;
}
export default function StatusCtaInfo( props: Props ) {
	const { conversionAction, domainCategory } = props;
	// if there's a domain category, use that instead of the conversion action
	const finalStatus = domainCategory ?? conversionAction;

	switch ( finalStatus ) {
		case 'wordpress-com':
			return (
				<p>
					{ translate(
						'Host your site with {{strong}}WordPress.com{{/strong}} ' +
							'and benefit from one of the best platforms in the world.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'wordpress-org':
			return (
				<p>
					{ translate(
						'Create a place for your business, your interests, ' +
							'or anything else—with the open source platform that powers the web.'
					) }
				</p>
			);
		case 'automattic-com':
			return (
				<p>
					{ translate(
						'At {{strong}}Automattic{{/strong}}, we’re passionate about making the web a better place.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'tumblr-com':
			return (
				<p>
					{ translate(
						'It’s time to try {{strong}}Tumblr{{/strong}}. You’ll never be bored again.',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'gravatar-com':
			return (
				<p>{ translate( 'Global avatar —“Gravatar” get it? One pic for all your profiles.' ) }</p>
			);
		case 'akismet-com':
			return (
				<p>
					{ translate(
						'Akismet’s advanced AI filters out comment, form, and text spam with 99.99% accuracy, ' +
							'so you never have to worry about it again.'
					) }
				</p>
			);
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
		case 'local-development':
		case 'wpcom-sp':
		case 'genaral-a8c-properties':
			return (
				<p>
					{ translate(
						'If you own a site, consider hosting it with {{strong}}WordPress.com{{/strong}} and ' +
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
