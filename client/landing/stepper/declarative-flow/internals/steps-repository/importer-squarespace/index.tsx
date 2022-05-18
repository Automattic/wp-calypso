import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import SquarespaceImporter from 'calypso/signup/steps/import-from/squarespace';
import { withImporterWrapper } from '../importer';
import './style.scss';

const ImporterSquarespace: Step = function ( props ) {
	const Importer = withImporterWrapper( SquarespaceImporter );

	return <Importer importer={ 'squarespace' } { ...props } />;
};

export default ImporterSquarespace;
