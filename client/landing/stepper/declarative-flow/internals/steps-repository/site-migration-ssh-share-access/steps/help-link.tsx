import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';

interface HelpLinkProps {
	href: string;
}

export const HelpLink: FC< HelpLinkProps > = ( { href } ) => {
	const translate = useTranslate();

	return (
		<p className="migration-site-ssh__help-link">
			{ translate( 'Need help?' ) }{ ' ' }
			<ExternalLink href={ href } icon iconSize={ 14 }>
				{ translate( 'Follow our guide' ) }
			</ExternalLink>
		</p>
	);
};
