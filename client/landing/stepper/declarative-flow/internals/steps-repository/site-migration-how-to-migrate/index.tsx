import { PLAN_BUSINESS, getPlan, isWpComBusinessPlan } from '@automattic/calypso-products';
import { NextButton, Step } from '@automattic/onboarding';
import { copy, lockOutline } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useMigrationCancellation } from 'calypso/data/site-migration/landing/use-migration-cancellation';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import { ChecklistCard } from '../../components/checklist-card';
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
	const { navigation, headerText, subHeaderText } = props;
	const translate = useTranslate();
	const site = useSite();
	const { mutate: cancelMigration } = useMigrationCancellation( site?.ID );

	usePresalesChat( 'wpcom' );

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
		navigation?.goBack?.();
	}, [ cancelMigration, navigation ] );

	const renderSubHeaderText = () => {
		const planName = getPlan( PLAN_BUSINESS )?.getTitle() ?? '';
		const isBusinessPlan = site?.plan?.product_slug
			? isWpComBusinessPlan( site?.plan?.product_slug )
			: false;

		return isBusinessPlan
			? // translators: %(planName)s is the name of the Business plan.
			  translate(
					"Save yourself the headache of migrating. Our expert team takes care of everything without interrupting your current site. Plus it's included in your %(planName)s plan.",
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
				<ChecklistCard title={ translate( 'How it works' ) } items={ checklistItems } />
			</div>
		);
	};

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
