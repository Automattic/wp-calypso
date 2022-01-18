/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { getTitanProductName } from 'calypso/lib/titan';
import { ADDING_GSUITE_TO_YOUR_SITE, ADDING_TITAN_TO_YOUR_SITE } from 'calypso/lib/url/support';
import type { EmailProviderFeatures } from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';

export const professionalEmailFeatures: EmailProviderFeatures = {
	slug: 'professional-email',
	name: getTitanProductName(),
	description: translate( 'Integrated email solution for your WordPress.com site.' ),
	logo: <Gridicon className="professional-email-logo" icon="my-sites" />,
	list: {
		importing: translate( 'One-click import of existing emails and contacts' ),
		storage: translate( '30GB storage' ),
		support: translate( '24/7 support via email' ),
		tools: translate( 'Integrated email management, Inbox, Calendar and Contacts' ),
	},
	supportUrl: ADDING_TITAN_TO_YOUR_SITE,
};

export const googleWorkspaceFeatures: EmailProviderFeatures = {
	slug: 'google-workspace',
	name: getGoogleMailServiceFamily(),
	description: translate(
		'Professional email integrated with Google Meet and other productivity tools from Google.'
	),
	logo: (
		<img
			alt={ translate( 'Google Workspace icon', { textOnly: true } ) }
			className="google-workspace-logo"
			src={ googleWorkspaceIcon }
		/>
	),
	list: {
		importing: translate( 'Easy to import your existing emails and contacts' ),
		storage: translate( '30GB storage' ),
		support: translate( '24/7 support via email' ),
		tools: translate( 'Gmail, Calendar, Meet, Chat, Drive, Docs, Sheets, Slides and more' ),
	},
	supportUrl: ADDING_GSUITE_TO_YOUR_SITE,
};
