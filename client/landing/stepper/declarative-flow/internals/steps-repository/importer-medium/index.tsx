import MediumImporter from 'calypso/blocks/importer/medium';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const ImporterMedium: Step = function ( props ) {
	const Importer = withImporterWrapper( MediumImporter );

	return <Importer importer={ 'medium' } { ...props } />;
};

export default ImporterMedium;
