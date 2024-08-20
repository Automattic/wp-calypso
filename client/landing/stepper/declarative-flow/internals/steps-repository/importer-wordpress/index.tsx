import { StepNavigationLink, MIGRATION_FLOW } from '@automattic/onboarding';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import WordpressImporter from 'calypso/blocks/importer/wordpress';
import { WPImportOption } from 'calypso/blocks/importer/wordpress/types';
import { MigrationAssistanceModal } from 'calypso/landing/stepper/declarative-flow/internals/components/migration-assistance-modal';
import { useStepNavigator } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/importer/hooks/use-step-navigator';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { withImporterWrapper } from '../importer';
import type { StepProps } from '../../types';
import type { FC, ReactElement } from 'react';
import './style.scss';

const Importer = withImporterWrapper( WordpressImporter );

interface Props extends StepProps {
	customizedActionButtons?: ReactElement;
}

const ImporterWordpress: FC< Props > = function ( props ) {
	const translate = useTranslate();
	const queryParams = useQuery();
	const site = useSite();
	const migrateFrom = queryParams.get( 'from' );
	const showMigrationModal = queryParams.get( 'showModal' );
	const siteSlug = queryParams.get( 'siteSlug' );
	const stepNavigator = useStepNavigator(
		props.flow,
		props.navigation,
		site?.ID,
		siteSlug,
		migrateFrom
	);

	let customizedActionButtons;
	if ( queryParams.get( 'ref' ) === MIGRATION_FLOW ) {
		customizedActionButtons = (
			<StepNavigationLink
				direction="forward"
				handleClick={ () => {
					props.navigation.submit?.( { action: 'customized-action-flow' } );
				} }
				label={ translate( 'I want to migrate my entire site' ) }
				cssClass={ clsx( 'step-container__navigation-link', 'forward', 'has-underline' ) }
				borderless
			/>
		);
	}

	return (
		<>
			{ showMigrationModal && (
				<MigrationAssistanceModal
					onConfirm={ () => {
						stepNavigator?.goToCheckoutPage?.( WPImportOption.EVERYTHING, {
							redirect_to: `/setup/${ encodeURIComponent(
								props.flow
							) }/migrateMessage?from=${ encodeURIComponent(
								migrateFrom || ''
							) }&siteSlug=${ encodeURIComponent( siteSlug || '' ) }`,
						} );
					} }
					migrateFrom={ migrateFrom }
					navigateBack={ props.navigation.goBack }
				/>
			) }
			<Importer
				importer="wordpress"
				{ ...props }
				customizedActionButtons={ customizedActionButtons }
			/>
		</>
	);
};

export default ImporterWordpress;
