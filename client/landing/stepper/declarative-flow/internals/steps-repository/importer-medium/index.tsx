import MediumImporter from 'calypso/blocks/importer/medium';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const Importer = withImporterWrapper( MediumImporter );

const ImporterMedium: Step = function ( props ) {
	return <Importer importer="medium" { ...props } />;
};

export default ImporterMedium;
