import WordpressImporter from 'calypso/blocks/importer/wordpress';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const ImporterWordpress: Step = function ( props ) {
	const Importer = withImporterWrapper( WordpressImporter );

	return <Importer importer={ 'wordpress' } { ...props } />;
};

export default ImporterWordpress;
