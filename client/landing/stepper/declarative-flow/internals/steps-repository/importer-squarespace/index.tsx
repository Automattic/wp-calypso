import SquarespaceImporter from 'calypso/blocks/importer/squarespace';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const Importer = withImporterWrapper( SquarespaceImporter );

const ImporterSquarespace: Step = function ( props ) {
	return <Importer importer="squarespace" { ...props } />;
};

export default ImporterSquarespace;
