import BloggerImporter from 'calypso/blocks/importer/blogger';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const ImporterBlogger: Step = function ( props ) {
	const Importer = withImporterWrapper( BloggerImporter );

	return <Importer importer={ 'blogger' } { ...props } />;
};

export default ImporterBlogger;
