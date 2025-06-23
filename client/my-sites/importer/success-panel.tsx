import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { SiteDetails } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { resetImport } from 'calypso/state/imports/actions';

import './success-panel.scss';

interface SuccessPanelProps {
	site: SiteDetails;

	importerStatus: {
		importerId: string;
		type: string;
	};
	onClose?: () => void;
}

const SuccessPanel = ( { site, importerStatus, onClose }: SuccessPanelProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const engine = importerStatus.type;

	useEffect( () => {
		dispatch( resetImport( site.ID, importerStatus.importerId ) );
	}, [ dispatch, site.ID, importerStatus.importerId ] );

	const handleClick = useCallback( () => {
		recordTracksEvent( 'calypso_importer_main_done_clicked', {
			blog_id: site.ID,
			importer_id: engine,
			action: 'customize',
		} );

		page( '/customize/' + ( site.slug || '' ) );
	}, [ engine, site.ID, site.slug ] );

	const handleImportMoreContent = useCallback( () => {
		recordTracksEvent( 'calypso_importer_main_done_clicked', {
			blog_id: site.ID,
			importer_id: engine,
			action: 'import-more-content',
		} );
		onClose?.();
	}, [ engine, onClose, site.ID ] );

	return (
		<div className="importer__success-panel">
			<h2>{ translate( 'Success!' ) } 🎉</h2>
			<p className="importer__success-panel-message">
				{ translate( 'Your content has been imported successfully to %(title)s.', {
					args: { title: site.title },
					comment: '%(title)s is the title of the site which user is importing content to.',
				} ) }
			</p>
			<div className="importer__success-panel-buttons">
				<Button variant="primary" onClick={ handleClick }>
					{ translate( 'Customize site' ) }
				</Button>
				<Button variant="tertiary" onClick={ handleImportMoreContent }>
					{ translate( 'Import more content' ) }
				</Button>
			</div>
		</div>
	);
};

export default SuccessPanel;
