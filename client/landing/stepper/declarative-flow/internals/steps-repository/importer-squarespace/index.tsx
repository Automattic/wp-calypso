import SquarespaceImporter from 'calypso/blocks/importer/squarespace';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { withImporterWrapper } from '../importer';
import './style.scss';

const ImporterSquarespace: Step = function ( props ) {
	const Importer = withImporterWrapper( SquarespaceImporter );

	return <Importer importer={ 'squarespace' } { ...props } />;
};

export default ImporterSquarespace;
