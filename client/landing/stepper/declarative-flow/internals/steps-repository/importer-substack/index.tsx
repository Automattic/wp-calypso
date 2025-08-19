import SubstackImporter from 'calypso/blocks/importer/substack';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const Importer = withImporterWrapper( SubstackImporter );

const ImporterSubstack: Step< { submits: Record< string, unknown > } > = function ( props ) {
	return <Importer importer="substack" { ...props } />;
};

export default ImporterSubstack;
