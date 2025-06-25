import BloggerImporter from 'calypso/blocks/importer/blogger';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';
const Importer = withImporterWrapper( BloggerImporter );

const ImporterBlogger: Step< { submits: Record< string, unknown > } > = function ( props ) {
	return <Importer importer="blogger" { ...props } />;
};

export default ImporterBlogger;
