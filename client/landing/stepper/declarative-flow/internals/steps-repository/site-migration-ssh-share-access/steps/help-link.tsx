import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';

interface HelpLinkProps {
	supportLink: string;
	supportPostId?: number;
}

export const HelpLink: FC< HelpLinkProps > = ( { supportLink, supportPostId } ) => {
	const translate = useTranslate();

	return (
		<p className="migration-site-ssh__help-link">
			{ translate( 'Need help?' ) }{ ' ' }
			<InlineSupportLink
				supportLink={ supportLink }
				supportPostId={ supportPostId }
				showIcon={ false }
			>
				{ translate( 'Follow our guide' ) }
			</InlineSupportLink>
		</p>
	);
};
