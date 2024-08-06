import { StepContainer, SubTitle, Title } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { StepProps } from '../../types';
import './style.scss';

interface Props extends StepProps {}

const ImportOrMigrateWithUpgrade: FC< Props > = ( { navigation } ) => {
	const translate = useTranslate();
	const goToCheckout = () => navigation?.submit?.( { action: 'upgrade-and-migrate' } );
	const goToImport = () => navigation?.submit?.( { action: 'import' } );

	return (
		<>
			<DocumentHead title={ translate( 'The plan you need' ) } />
			<StepContainer
				shouldHideNavButtons
				hideFormattedHeader
				stepName="import-or-migrate-with-upgrade"
				stepContent={
					<>
						<Title>{ translate( 'The plan you need' ) }</Title>
						<SubTitle>{ translate( 'Migrations are exclusive to the Creator plan' ) }</SubTitle>
						<Button variant="primary" onClick={ goToCheckout }>
							Get the plan and migrate
						</Button>
						<Button variant="primary" onClick={ goToImport }>
							Import your site
						</Button>
					</>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default ImportOrMigrateWithUpgrade;
