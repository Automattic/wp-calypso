import WixImporter from 'calypso/blocks/importer/wix';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const Importer = withImporterWrapper( WixImporter );

const ImporterWix: Step = function ( props ) {
	return <Importer importer="wix" { ...props } navigation={ props.navigation } />;
};

export default ImporterWix;
