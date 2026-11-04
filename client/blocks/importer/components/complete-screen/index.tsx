import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Hooray, SubTitle, Title } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect } from 'react';
import { ImportJob } from '../../types';
import DoneButton from '../done-button';

interface Props {
	job: ImportJob;
	siteId: number;
	siteSlug: string;
	resetImport: ( siteId: number, importerId: string ) => void;
	buttonLabel?: string;
	onSiteViewClick?: () => void;
	onImportAnotherClick?: () => void;
}
const CompleteScreen: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { job, siteId, buttonLabel, resetImport, onSiteViewClick, onImportAnotherClick } = props;

	// A successful `import-site` API request in `state/imports/site-importer/actions` records the
	// same event name, so one import can record it twice.
	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_start_import_success' );
	}, [] );

	return (
		<Hooray>
			<div className="import__heading import__heading-center">
				<Title>{ __( 'Hooray!' ) }</Title>
				<SubTitle>{ __( 'Congratulations. Your content was successfully imported.' ) }</SubTitle>
				<DoneButton
					siteId={ siteId }
					job={ job as ImportJob }
					resetImport={ resetImport }
					label={ buttonLabel }
					onSiteViewClick={ onSiteViewClick }
				/>
				{ onImportAnotherClick && (
					<div>
						<Button variant="link" __next40pxDefaultSize onClick={ onImportAnotherClick }>
							{ __( 'Start another import' ) }
						</Button>
					</div>
				) }
			</div>
		</Hooray>
	);
};

export default CompleteScreen;
