import { NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

interface Props {
	onSubmit: () => void;
	onSkip: () => void;
}

export const ImportPlatformForwarder: FC< Props > = ( { onSubmit, onSkip } ) => {
	const translate = useTranslate();

	const handleSubmit = () => {
		recordTracksEvent( 'calypso_site_migration_automated_other_platform_import_btn_clicked' );
		onSubmit();
	};

	const handleSkip = () => {
		recordTracksEvent( 'calypso_site_migration_automated_other_platform_import_skip_btn_clicked' );
		onSkip();
	};

	return (
		<form className="site-migration-other-platform__form" onSubmit={ handleSubmit }>
			<div className="site-migration-other-platform__submit">
				<NextButton type="submit">{ translate( 'Import Your Content' ) }</NextButton>
			</div>

			<div className="site-migration-credentials__skip">
				<button
					className="button navigation-link step-container__navigation-link has-underline is-borderless"
					onClick={ handleSkip }
					type="button"
				>
					{ translate( 'I need help, please guide me' ) }
				</button>
			</div>
		</form>
	);
};
