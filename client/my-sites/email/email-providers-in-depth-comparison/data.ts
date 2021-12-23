import { translate } from 'i18n-calypso';
import emailForwarding from 'calypso/assets/images/email-providers/forwarding.svg';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import { EmailProviderFeatures } from 'calypso/my-sites/email/email-providers-in-depth-comparison/comparison-table';

export const professionalEmailFeatures: EmailProviderFeatures = {
	id: 'professional-email',
	header: 'Professional Email',
	headerLogo: 'my-sites',
	footerBadge: poweredByTitanLogo,
	headerLogoIsGridIcon: true,
	importing: translate( 'One-click import of existing emails and contacts' ),
	learnMore: 'link-to-professional-email',
	storage: translate( '30GB storage' ),
	tools: translate( 'Integrated email management, Inbox, calendar and contacts' ),
	subtitle: translate( 'Integrated email solution for your WordPress.com site' ),
	support: translate( '24/7 support via email' ),
};

export const googleWorkspaceFeatures: EmailProviderFeatures = {
	id: 'google-workspace',
	header: 'Google Workspace',
	headerLogo: googleWorkspaceIcon,
	importing: translate( 'Easy to import your existing emails and contacts' ),
	learnMore: 'link-to-google-workspace',
	storage: translate( '30GB storage' ),
	tools: translate( 'Gmail, Calendar, Meet, Chat, Drive, Docs, Sheets, Slides and more' ),
	subtitle: translate( 'Gmail and other productivity tools from Google' ),
	support: translate( '24/7 support via email' ),
};

export const emailForwardingFeatures: EmailProviderFeatures = {
	id: 'email-forwarding',
	header: 'Email Forwarding',
	headerLogo: emailForwarding,
	importing: '-',
	learnMore: '',
	storage: '-',
	subtitle: translate( 'Forward your email at your custom domain to another address' ),
	support: translate( '24/7 support via email' ),
	tools: '-',
};
