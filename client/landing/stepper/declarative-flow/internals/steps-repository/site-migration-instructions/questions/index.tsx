import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { FC } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import './style.scss';

export const Questions: FC = () => {
	const translate = useTranslate();

	return (
		<div className="site-migration-instructions-questions">
			<span className="site-migration-instructions-questions__label">
				{ translate( 'Questions?' ) }
			</span>
			<ExternalLink
				href="https://wordpress.com/help/contact/"
				target="_blank"
				onClick={ () => {
					recordTracksEvent(
						'calypso_onboarding_site_migration_instructions_questions_happiness_engineer'
					);
				} }
			>
				{ translate( 'Ask a Happiness Engineer' ) }
			</ExternalLink>
		</div>
	);
};
