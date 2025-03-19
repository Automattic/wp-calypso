import SquarespaceImporter from 'calypso/blocks/importer/squarespace';
import { withImporterWrapper } from '../importer';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const Importer = withImporterWrapper( SquarespaceImporter );

const ImporterSquarespace: Step< { submits: Record< string, unknown > } > = function ( props ) {
	return <Importer importer="squarespace" { ...props } />;
};

export default ImporterSquarespace;
