import { Dialog } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import SiteLogsDownloadPanel from '../site-logs-download-panel';

import './style.scss';

type Props = {
	onRefresh: () => void;
};

export const SiteLogsToolbar = ( props: Props ) => {
	const { onRefresh } = props;
	const { __ } = useI18n();

	const [ showDownload, setShowDownload ] = useState( false );

	const handleShowDownload = () => {
		setShowDownload( true );
	};

	const handleHideDownload = () => {
		setShowDownload( false );
	};

	const maybeRenderDialog = () => {
		if ( ! showDownload ) {
			return null;
		}
		return (
			<Dialog isVisible onClose={ handleHideDownload }>
				<SiteLogsDownloadPanel />
			</Dialog>
		);
	};

	return (
		<>
			<div className="site-logs-toolbar">
				<Button isSecondary onClick={ onRefresh }>
					{ __( 'Refresh' ) }
				</Button>

				<Button isSecondary onClick={ handleShowDownload }>
					{ __( 'Download' ) }
				</Button>
			</div>
			{ maybeRenderDialog() }
		</>
	);
};
