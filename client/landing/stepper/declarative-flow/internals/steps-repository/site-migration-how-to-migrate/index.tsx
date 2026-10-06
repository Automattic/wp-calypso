import { NextButton, Step } from '@automattic/onboarding';
import { canInstallPlugins } from '@automattic/sites';
import { Button } from '@wordpress/components';
import { copy, lockOutline } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useMigrationCancellation } from 'calypso/data/site-migration/landing/use-migration-cancellation';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useSiteDetails } from 'calypso/landing/stepper/hooks/use-site';
import {
	recordMigrationStartEvent,
	recordMigrationStartFacebookEvent,
} from 'calypso/lib/analytics/ad-tracking/record-migration-events';
import { ChecklistCard } from '../../components/checklist-card';
import type { Step as StepType } from '../../types';
import './style.scss';

const SiteMigrationHowToMigrate: StepType< {
	accepts: {
		headerText?: string;
		subHeaderText?: string;
	};
	submits: {
		how?: string;
		destination: string;
	};
} > = ( props ) => {
	const { navigation, headerText, subHeaderText } = props;
	const translate = useTranslate();
	const { data: site, isLoading, isError, refetch } = useSiteDetails();
	const { mutate: cancelMigration } = useMigrationCancellation( site?.ID );
	const { deleteMigrationSticker } = useMigrationStickerMutation();

	useEffect( () => {
		recordMigrationStartEvent( 'SiteMigrationHowToMigrate' );
		recordMigrationStartFacebookEvent( 'SiteMigrationHowToMigrate' );
	}, [] );

	const checklistItems = useMemo(
		() => [
			{
				icon: lockOutline,
				text: translate( 'Upgrade your site and securely share access to your current site.' ),
			},
			{
				icon: copy,
				text: translate(
					"We'll bring over a copy of your site, without affecting the current live version."
				),
			},
		],
		[ translate ]
	);

	const handleClick = async ( value: string ) => {
		const siteCanInstallPlugins = canInstallPlugins( site );

		const destination = siteCanInstallPlugins ? 'migrate' : 'upgrade';

		if ( navigation.submit ) {
			return navigation.submit( { how: value, destination } );
		}
	};

	const goBack = useCallback( () => {
		cancelMigration();
		navigation?.goBack?.();
	}, [ cancelMigration, navigation ] );

	const handleImport = () => {
		if ( site?.ID ) {
			deleteMigrationSticker( site.ID );
			cancelMigration();
		}
		return navigation.submit?.( { destination: 'import' } );
	};

	const renderSubHeaderText = () => {
		const siteCanInstallPlugins = canInstallPlugins( site );

		return siteCanInstallPlugins
			? translate(
					"Save yourself the headache of migrating. Our expert team takes care of everything without interrupting your current site. Plus it's included in your plan."
				)
			: translate(
					'Skip the migration hassle. Our team handles everything without disrupting your current site.'
				);
	};

	const renderStepContent = () => {
		return (
			<div className="how-to-migrate__experiment-expectations">
				<NextButton onClick={ () => handleClick( HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) }>
					{ translate( 'Get started' ) }
				</NextButton>
				<ChecklistCard title={ translate( 'How it works' ) } items={ checklistItems } />
				<Button variant="link" onClick={ handleImport }>
					{ translate( 'Import a WordPress export file' ) }
				</Button>
			</div>
		);
	};

	if ( isLoading ) {
		return <Step.Loading />;
	}

	if ( isError || ! site ) {
		const errorTitle = translate( "We couldn't load your site" );

		return (
			<>
				<DocumentHead title={ errorTitle } />
				<Step.CenteredColumnLayout
					columnWidth={ 6 }
					topBar={
						<Step.TopBar
							leftElement={ navigation.goBack && <Step.BackButton onClick={ navigation.goBack } /> }
						/>
					}
					heading={
						<Step.Heading
							text={ errorTitle }
							subText={
								refetch
									? translate( 'Please try again, or go back to choose another site.' )
									: translate( 'Go back to choose a destination site.' )
							}
						/>
					}
				>
					{ refetch && (
						<div className="how-to-migrate__experiment-expectations">
							<NextButton onClick={ refetch }>{ translate( 'Try again' ) }</NextButton>
						</div>
					) }
				</Step.CenteredColumnLayout>
			</>
		);
	}

	return (
		<>
			<DocumentHead title={ translate( 'Let us migrate your site' ) } />
			<Step.CenteredColumnLayout
				className="how-to-migrate-v2"
				columnWidth={ 6 }
				topBar={
					<Step.TopBar
						leftElement={ <Step.BackButton onClick={ goBack } /> }
						rightElement={
							<Step.SkipButton onClick={ () => handleClick( HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF ) }>
								{ translate( "I'll do it myself" ) }
							</Step.SkipButton>
						}
					/>
				}
				heading={
					<Step.Heading
						text={ headerText ?? translate( 'Let us migrate your site' ) }
						subText={ subHeaderText || renderSubHeaderText() }
					/>
				}
			>
				{ renderStepContent() }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationHowToMigrate;
