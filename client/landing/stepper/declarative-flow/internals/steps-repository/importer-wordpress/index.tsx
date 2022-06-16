import WordpressImporter from 'calypso/blocks/importer/wordpress';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const Importer = withImporterWrapper( WordpressImporter );

const ImporterWordpress: Step = function ( props ) {
	return <Importer importer={ 'wordpress' } { ...props } />;
};

export default ImporterWordpress;
