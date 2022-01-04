import { translate } from 'i18n-calypso';
import type { EmailProviderFeatures } from 'calypso/my-sites/email/email-providers-in-depth-comparison/types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const professionalEmailFeatures: EmailProviderFeatures = {
	header: 'Professional Email',
	tools: translate( 'Integrated email management, Inbox, calendar and contacts' ),
	storage: translate( '30GB storage' ),
	importing: translate( 'One-click import of existing emails and contacts' ),
	support: translate( '24/7 support via email' ),
	selectCallback: noop,
};

export const googleWorkspaceFeatures: EmailProviderFeatures = {
	header: 'Google Workspace',
	tools: translate( 'Gmail, Calendar, Meet, Chat, Drive, Docs, Sheets, Slides and more' ),
	storage: translate( '30GB storage' ),
	importing: translate( 'Easy to import your existing emails and contacts' ),
	support: translate( '24/7 support via email' ),
	selectCallback: noop,
};
