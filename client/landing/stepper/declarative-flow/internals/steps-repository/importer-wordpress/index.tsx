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
	// TODO: previously, customizedActionButtons was always overridden to undefined
	// Was it a bug, or was it intentional?
	return <Importer importer="wordpress" { ...props } />;
};

export default ImporterWordpress;
