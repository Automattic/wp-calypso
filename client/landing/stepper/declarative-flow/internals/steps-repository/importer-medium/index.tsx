import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import MediumImporter from 'calypso/signup/steps/import-from/medium';
import { withImporterWrapper } from '../importer';
import './style.scss';

const ImporterMedium: Step = function ( props ) {
	const Importer = withImporterWrapper( MediumImporter );

	return <Importer importer={ 'medium' } { ...props } />;
};

export default ImporterMedium;
