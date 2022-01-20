/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import { getTitanProductName } from 'calypso/lib/titan';
import { TITAN_PRODUCT_TYPE } from 'calypso/lib/titan/constants';
import { ADDING_GSUITE_TO_YOUR_SITE, ADDING_TITAN_TO_YOUR_SITE } from 'calypso/lib/url/support';
import type { EmailProviderFeatures } from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';

export const professionalEmailFeatures: EmailProviderFeatures = {
	badge: (
		<img
			alt={ translate( 'Powered by Titan icon', { textOnly: true } ) }
			src={ poweredByTitanLogo }
		/>
	),
	slug: TITAN_PRODUCT_TYPE,
	name: getTitanProductName(),
	description: translate(
		'Integrated email solution with powerful features for your WordPress.com site.'
	),
	logo: <Gridicon className="professional-email-logo" icon="my-sites" />,
	list: {
		importing: translate( 'One-click import of existing emails and contacts' ),
		storage: translate( '30GB storage' ),
		support: translate( '24/7 support via email' ),
		tools: translate( 'Integrated email management, Inbox, Calendar and Contacts' ),
	},
	supportUrl: ADDING_TITAN_TO_YOUR_SITE,
	table: {
		access: translate( 'Online' ),
		collaboration: translate( 'None' ),
		importing: translate( 'One-click import of existing emails and contacts' ),
		storage: translate( '30GB storage' ),
		support: translate( '24/7 via email' ),
		tools: translate( 'Integrated email management, Inbox, Calendar and Contacts' ),
	},
};

export const googleWorkspaceFeatures: EmailProviderFeatures = {
	slug: GOOGLE_WORKSPACE_PRODUCT_TYPE,
	name: getGoogleMailServiceFamily(),
	description: translate( 'Business email with Gmail and other productivity tools from Google.' ),
	logo: (
		<img
			alt={ translate( 'Google Workspace icon', { textOnly: true } ) }
			className="google-workspace-logo"
			src={ googleWorkspaceIcon }
		/>
	),
	list: {
		access: translate( 'Online & offline access' ),
		collaboration: translate( 'Real-time collaboration' ),
		importing: translate( 'Easy to import your existing emails and contacts' ),
		storage: translate( '30GB storage with shared files' ),
		support: translate( '24/7 support via email' ),
		tools: translate(
			'Gmail, Calendar, Contacts, Meet, Chat, Drive, Docs, Sheets, Slides and more'
		),
	},
	supportUrl: ADDING_GSUITE_TO_YOUR_SITE,
	table: {
		access: translate( 'Online & offline' ),
		collaboration: translate( 'Real-time' ),
		importing: translate( 'Easy to import your existing emails and contacts' ),
		storage: translate( '30GB storage with shared files' ),
		support: translate( '24/7 via email' ),
		tools: translate(
			'Gmail, Calendar, Contacts, Meet, Chat, Drive, Docs, Sheets, Slides and more'
		),
	},
};
