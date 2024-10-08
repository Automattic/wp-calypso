import { NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
interface Props {
	onSubmit: () => void;
	onSkip: () => void;
}

export const ImportPlatformForwarder: FC< Props > = ( { onSubmit, onSkip } ) => {
	const translate = useTranslate();

	const handleImport = () => {
		onSubmit();
	};

	const handleSkip = () => {
		onSkip();
	};

	return (
		<div className="site-migration-other-platform__actions">
			<NextButton onClick={ handleImport }>{ translate( 'Import Your Content' ) }</NextButton>

			<button
				className="button navigation-link step-container__navigation-link has-underline is-borderless"
				onClick={ handleSkip }
				type="button"
			>
				{ translate( 'I need help, please guide me' ) }
			</button>
		</div>
	);
};
