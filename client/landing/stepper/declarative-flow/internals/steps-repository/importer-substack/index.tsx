import SubstackImporter from 'calypso/blocks/importer/substack';
import { withImporterWrapper } from '../importer';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const Importer = withImporterWrapper( SubstackImporter );

const ImporterSubstack: Step< { submits: Record< string, unknown > } > = function ( props ) {
	return <Importer importer="substack" { ...props } />;
};

export default ImporterSubstack;
