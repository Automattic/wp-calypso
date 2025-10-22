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
			<a href={ href } target="_blank" rel="noopener noreferrer">
				{ translate( 'Follow our guide' ) }
			</a>
		</p>
	);
};
