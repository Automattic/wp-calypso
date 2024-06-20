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
			<a
				href="https://wordpress.com/help/contact/"
				target="_blank"
				rel="noopener noreferrer"
				onClick={ () => {
					recordTracksEvent(
						'calypso_onboarding_site_migration_instructions_questions_happiness_engineer'
					);
				} }
			>
				{ translate( 'Ask a Happiness Engineer' ) }
			</a>
		</div>
	);
};
