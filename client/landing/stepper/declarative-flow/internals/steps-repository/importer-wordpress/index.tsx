import WordpressImporter from 'calypso/blocks/importer/wordpress';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { MigrationAssistanceModal } from '../../components/migration-assistance-modal';
import { withImporterWrapper } from '../importer';
import './style.scss';

const Importer = withImporterWrapper( WordpressImporter );

const ImporterWordpress: Step = function ( props ) {
	const queryParams = new URLSearchParams( props?.data?.path || window.location.search );
	const migrateFrom = queryParams.get( 'from' );
	const showMigrationModal = queryParams.get( 'showModal' );

	return (
		<>
			{ showMigrationModal && (
				<MigrationAssistanceModal
					onConfirm={ () => {} }
					migrateFrom={ migrateFrom }
					navigateBack={ props.navigation.goBack }
				/>
			) }
			<Importer importer="wordpress" { ...props } />;
		</>
	);
};

export default ImporterWordpress;
