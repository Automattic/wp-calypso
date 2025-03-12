import WordpressImporter from 'calypso/blocks/importer/wordpress';
import { withImporterWrapper } from '../importer';
import type { StepProps } from '../../types';
import type { FC, ReactElement } from 'react';
import './style.scss';

const Importer = withImporterWrapper( WordpressImporter );

interface Props extends StepProps {
	customizedActionButtons?: ReactElement;
}

const ImporterWordpress: FC< Props > = function ( props ) {
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
