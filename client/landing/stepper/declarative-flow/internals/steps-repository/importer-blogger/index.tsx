import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import BloggerImporter from 'calypso/signup/steps/import-from/blogger';
import { withImporterWrapper } from '../importer';
import './style.scss';

const ImporterBlogger: Step = function ( props ) {
	const Importer = withImporterWrapper( BloggerImporter );

	return <Importer importer={ 'blogger' } { ...props } />;
};

export default ImporterBlogger;
