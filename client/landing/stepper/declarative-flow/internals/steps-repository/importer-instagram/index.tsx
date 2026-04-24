import InstagramImporter from 'calypso/blocks/importer/instagram';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const Importer = withImporterWrapper( InstagramImporter );

const ImporterInstagram: Step< { submits: Record< string, unknown > } > = function ( props ) {
	return <Importer importer="instagram" { ...props } />;
};

export default ImporterInstagram;
