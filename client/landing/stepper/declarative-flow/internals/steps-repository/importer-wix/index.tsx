import WixImporter from 'calypso/blocks/importer/wix';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const ImporterWix: Step = function ( props ) {
	const Importer = withImporterWrapper( WixImporter );

	return <Importer importer={ 'wix' } { ...props } />;
};

export default ImporterWix;
