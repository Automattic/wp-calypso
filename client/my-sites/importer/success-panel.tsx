import { useTranslate } from 'i18n-calypso';
import ImporterActionButtonContainer from './importer-action-buttons/container';
import DoneButton from './importer-action-buttons/done-button';

import './success-panel.scss';

interface SuccessPanelProps {
	site: {
		title: string;
	};
	importerStatus: {
		importerId: string;
		type: string;
	};
}

const SuccessPanel = ( { site, importerStatus }: SuccessPanelProps ) => {
	const translate = useTranslate();
	return (
		<div className="importer__success-panel">
			<h2>{ translate( 'Success!' ) } 🎉</h2>
			<p className="importer__success-panel-message">
				{ translate( 'Your content has been imported successfully to %(title)s.', {
					args: { title: site.title },
					comment: '%(title)s is the title of the site which user is importing content to.',
				} ) }
			</p>
			<ImporterActionButtonContainer>
				<DoneButton customizeSiteVariant importerStatus={ importerStatus } site={ site } />
				<DoneButton importerStatus={ importerStatus } site={ site } />
			</ImporterActionButtonContainer>
		</div>
	);
};

export default SuccessPanel;
