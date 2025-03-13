import WordpressImporter from 'calypso/blocks/importer/wordpress';
import { withImporterWrapper } from '../importer';
import type { Step } from '../../types';
import type { ReactElement } from 'react';
import './style.scss';

const Importer = withImporterWrapper( WordpressImporter );

const ImporterWordpress: Step< {
	submits: { type: 'redirect'; url: string } | { action: 'verify-email' };
	accepts: { customizedActionButtons?: ReactElement };
} > = function ( props ) {
	let customizedActionButtons;

	return (
		<Importer
			importer="wordpress"
			{ ...props }
			customizedActionButtons={ customizedActionButtons }
		/>
	);
};

export default ImporterWordpress;
