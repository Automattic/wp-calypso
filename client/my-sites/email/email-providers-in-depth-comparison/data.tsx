/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { getTitanProductName } from 'calypso/lib/titan';
import type { EmailProviderFeatures } from 'calypso/my-sites/email/email-providers-in-depth-comparison/types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const professionalEmailFeatures: EmailProviderFeatures = {
	name: getTitanProductName(),
	logo: <Gridicon className="professional-email-logo" icon="my-sites" />,
	tools: translate( 'Integrated email management, Inbox, calendar and contacts' ),
	storage: translate( '30GB storage' ),
	importing: translate( 'One-click import of existing emails and contacts' ),
	support: translate( '24/7 support via email' ),
	selectCallback: noop,
};

export const googleWorkspaceFeatures: EmailProviderFeatures = {
	name: getGoogleMailServiceFamily(),
	logo: (
		<img
			alt={ translate( 'Google Workspace icon' ) }
			className="google-workspace-logo"
			src={ googleWorkspaceIcon }
		/>
	),
	tools: translate( 'Gmail, Calendar, Meet, Chat, Drive, Docs, Sheets, Slides and more' ),
	storage: translate( '30GB storage' ),
	importing: translate( 'Easy to import your existing emails and contacts' ),
	support: translate( '24/7 support via email' ),
	selectCallback: noop,
};
