import { PLAN_BUSINESS, getPlan, isWpComBusinessPlan } from '@automattic/calypso-products';
import { NextButton, Step, StepContainer } from '@automattic/onboarding';
import { Icon, copy, globe, lockOutline, scheduled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useMigrationCancellation } from 'calypso/data/site-migration/landing/use-migration-cancellation';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import { shouldUseStepContainerV2MigrationFlow } from '../../../helpers/should-use-step-container-v2';
import { DIYOption } from './diy-option';
import type { Step as StepType } from '../../types';
import './style.scss';

const SiteMigrationHowToMigrate: StepType< {
	accepts: {
		headerText?: string;
		subHeaderText?: string;
	};
	submits: {
		how: string;
		destination: string;
	};
} > = ( props ) => {
	const { navigation, headerText, stepName, subHeaderText, flow } = props;
	const translate = useTranslate();
	const site = useSite();
	const { mutate: cancelMigration } = useMigrationCancellation( site?.ID );
	const isUsingStepContainerV2 = shouldUseStepContainerV2MigrationFlow( flow );

	usePresalesChat( 'wpcom' );

	// Extract the display of items to a separate component if we keep this version post-experiment,
	// as this format is also used on the site identification page and further into the DIFM flow.
	const experimentalOptions = useMemo(
		() => [
			{
				icon: lockOutline,
				description: translate(
					'Upgrade your site and securely share access to your current site.'
				),
			},
			{
				icon: copy,
				description: translate(
					"We'll bring over a copy of your site, without affecting the current live version."
				),
			},
			{
				icon: scheduled,
				description: translate(
					"You'll get an update on the progress of your migration within 2-3 business days."
				),
			},
			{
				icon: globe,
				description: translate(
					"We'll help you switch your domain over after the migration's completed."
				),
			},
		],
		[ translate ]
	);

	const handleClick = async ( value: string ) => {
		const canInstallPlugins = site?.plan?.features?.active.find(
			( feature ) => feature === 'install-plugins'
		)
			? true
			: false;

		const destination = canInstallPlugins ? 'migrate' : 'upgrade';

		if ( navigation.submit ) {
			return navigation.submit( { how: value, destination } );
		}
	};

	const goBack = useCallback( () => {
		cancelMigration();
		navigation.goBack?.();
	}, [ cancelMigration, navigation ] );

	const renderSubHeaderText = () => {
		const planName = getPlan( PLAN_BUSINESS )?.getTitle() ?? '';
		const isBusinessPlan = site?.plan?.product_slug
			? isWpComBusinessPlan( site?.plan?.product_slug )
			: false;

		return isBusinessPlan
			? // translators: %(planName)s is the name of the Business plan.
			  translate(
					'Save yourself the headache of migrating. Our expert team takes care of everything without interrupting your current site. Plus it’s included in your %(planName)s plan.',
					{
						args: {
							planName,
						},
					}
			  )
			: // translators: %% is the percentage symbol, please leave it as is. %(planName)s is the name of the Business plan.
			  translate(
					'Skip the migration hassle. Our team handles everything without disrupting your current site, plus you get 50%% off our annual %(planName)s plan.',
					{
						args: {
							planName,
						},
					}
			  );
	};

	const renderStepContent = () => {
		return (
			<div className="how-to-migrate__experiment-expectations">
				<NextButton onClick={ () => handleClick( HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) }>
					{ translate( 'Get started' ) }
				</NextButton>
				<div className="how-to-migrate__process-details">
					<p className="how-to-migrate__process-details-title">{ translate( 'How it works' ) }</p>
					<ul className="how-to-migrate__process-details-list">
						{ experimentalOptions.map( ( option, index ) => (
							<li key={ index } className="how-to-migrate__process-details-list-item">
								<Icon
									className="how-to-migrate__process-details-icon"
									icon={ option.icon }
									size={ 24 }
								/>
								<p className="how-to-migrate__process-details-description">
									{ option.description }
								</p>
							</li>
						) ) }
					</ul>
				</div>
			</div>
		);
	};

	if ( isUsingStepContainerV2 ) {
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
								<Step.SkipButton
									onClick={ () => handleClick( HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF ) }
								>
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
	}

	return (
		<>
			<DocumentHead title={ translate( 'Let us migrate your site' ) } />
			<StepContainer
				stepName={ stepName ?? 'site-migration-how-to-migrate' }
				className="how-to-migrate"
				shouldHideNavButtons={ false }
				hideSkip
				formattedHeader={
					<FormattedHeader
						id="how-to-migrate-header"
						headerText={ headerText ?? translate( 'Let us migrate your site' ) }
						subHeaderText={ subHeaderText || renderSubHeaderText() }
						align="center"
					/>
				}
				stepContent={ renderStepContent() }
				recordTracksEvent={ recordTracksEvent }
				goBack={ goBack }
				customizedActionButtons={ <DIYOption onClick={ handleClick } /> }
			/>
		</>
	);
};

export default SiteMigrationHowToMigrate;
