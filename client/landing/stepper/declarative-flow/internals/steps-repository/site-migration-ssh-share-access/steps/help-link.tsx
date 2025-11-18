import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

interface HelpLinkProps {
	supportLink: string;
	supportPostId?: number;
	stepKey: string;
}

export const HelpLink: FC< HelpLinkProps > = ( { supportLink, supportPostId, stepKey } ) => {
	const translate = useTranslate();

	const handleClick = () => {
		recordTracksEvent( 'calypso_site_migration_ssh_action', {
			step: stepKey,
			action: 'click_guide',
			support_link: supportLink,
		} );
	};

	return (
		<p className="migration-site-ssh__help-link">
			{ translate( 'Need help?' ) }{ ' ' }
			<InlineSupportLink
				supportLink={ supportLink }
				supportPostId={ supportPostId }
				showIcon={ false }
				onClick={ handleClick }
			>
				{ translate( 'Follow our guide' ) }
			</InlineSupportLink>
		</p>
	);
};
