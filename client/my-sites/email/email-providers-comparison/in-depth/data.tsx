/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ADDING_GSUITE_TO_YOUR_SITE, ADDING_TITAN_TO_YOUR_SITE } from '@automattic/urls';
import { translate } from 'i18n-calypso';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import { getTitanProductName } from 'calypso/lib/titan';
import { TITAN_PRODUCT_TYPE } from 'calypso/lib/titan/constants';
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
		'Integrated email solution with powerful features. Manage your email and more on any device.'
	),
	logo: <Gridicon className="professional-email-logo" icon="my-sites" aria-hidden="true" />,
	list: {
		importing: translate( 'One-click import of existing emails and contacts' ),
		storage: translate( '30GB storage for emails' ),
		support: translate( '24/7 support via email' ),
		tools: translate( 'Inbox, Calendar and Contacts' ),
	},
	supportUrl: localizeUrl( ADDING_TITAN_TO_YOUR_SITE ),
	table: {
		collaboration: '-',
		importing: translate( 'One-click import of existing emails and contacts' ),
		storage: translate( '30GB for emails' ),
		support: translate( '24/7 via email' ),
		tools: translate( 'Inbox, Calendar and Contacts' ),
	},
};

export const googleWorkspaceFeatures: EmailProviderFeatures = {
	slug: GOOGLE_WORKSPACE_PRODUCT_TYPE,
	name: getGoogleMailServiceFamily(),
	description: translate(
		'Business email with Gmail. Includes other collaboration and productivity tools from Google.'
	),
	logo: <img alt="" className="google-workspace-logo" src={ googleWorkspaceIcon } />,
	list: {
		collaboration: translate( 'Real-time collaboration for Docs, Sheets, and Slides' ),
		importing: translate( 'Easy to import your existing emails and contacts' ),
		storage: translate( '30GB storage for emails and cloud storage' ),
		support: translate( '24/7 support via email' ),
		tools: translate(
			'Gmail, Calendar, Contacts, Meet, Chat, Drive, Docs, Sheets, Slides and more'
		),
	},
	supportUrl: localizeUrl( ADDING_GSUITE_TO_YOUR_SITE ),
	table: {
		collaboration: translate( 'Real-time for Docs, Sheets, and Slides' ),
		importing: translate( 'Easy to import your existing emails and contacts' ),
		storage: translate( '30GB for emails and cloud storage' ),
		support: translate( '24/7 via email' ),
		tools: translate(
			'Gmail, Calendar, Contacts, Meet, Chat, Drive, Docs, Sheets, Slides and more'
		),
	},
};
