import { ExternalLink } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Icon, warning } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';

import './style.scss';

interface CharsetWarningProps {
	dbCharset?: string;
}

const LATIN1_CHARSET = 'latin1';
const SUPPORT_URL = 'https://wordpress.com/support/help-support-options/#how-to-contact-us';
const CODEX_URL = 'https://codex.wordpress.org/Converting_Database_Character_Sets';

export const CharsetWarning: FC< CharsetWarningProps > = ( { dbCharset } ) => {
	const translate = useTranslate();

	const isLatin1 = dbCharset?.toLowerCase() === LATIN1_CHARSET;

	if ( ! isLatin1 ) {
		return null;
	}

	return (
		<div className="charset-warning">
			<div className="charset-warning__icon">
				<Icon icon={ warning } size={ 24 } />
			</div>
			<div className="charset-warning__content">
				<p className="charset-warning__text">
					{ translate(
						"{{strong}}Heads up!{{/strong}} Your WordPress.com site's database is encoded in Latin1. If your source site uses a different encoding (most sites use UTF-8), your migration may run into errors with special characters.",
						{
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>
				<p className="charset-warning__text">
					{ translate(
						"To resolve this, you can {{supportLink}}contact support{{/supportLink}} to have us convert your destination site to UTF-8 (this will reset your destination site's database and content). Alternatively, you can {{codexLink}}convert your source site to Latin1{{/codexLink}} before migrating.",
						{
							components: {
								supportLink: <ExternalLink href={ localizeUrl( SUPPORT_URL ) } />,
								codexLink: <ExternalLink href={ localizeUrl( CODEX_URL ) } />,
							},
						}
					) }
				</p>
			</div>
		</div>
	);
};
