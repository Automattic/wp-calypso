import WordpressImporter from 'calypso/blocks/importer/wordpress';
import { MigrationAssistanceModal } from 'calypso/landing/stepper/declarative-flow/internals/components/migration-assistance-modal';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { withImporterWrapper } from '../importer';
import './style.scss';

const Importer = withImporterWrapper( WordpressImporter );

const ImporterWordpress: Step = function ( props ) {
	const queryParams = useQuery();
	const migrateFrom = queryParams.get( 'from' );
	const showMigrationModal = queryParams.get( 'showModal' );
	const siteSlug = queryParams.get( 'siteSlug' );

	return (
		<>
			{ showMigrationModal && (
				<MigrationAssistanceModal
					onConfirm={ () => {
						props.navigation?.submit?.( {
							providedDependencies: {
								url: `/checkout/${ siteSlug }/business`,
							},
						} );
					} }
					migrateFrom={ migrateFrom }
					navigateBack={ props.navigation.goBack }
				/>
			) }
			<Importer importer="wordpress" { ...props } />;
		</>
	);
};

export default ImporterWordpress;
