import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { Step, StepContainer } from '@automattic/onboarding';
import { translate, useTranslate } from 'i18n-calypso';
import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { shouldUseStepContainerV2MigrationFlow } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useSubmitMigrationTicket } from 'calypso/landing/stepper/hooks/use-submit-migration-ticket';
import { UserData } from 'calypso/lib/user/user';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import FlowCard from '../components/flow-card';
import { redirect } from '../import/util';
import type { Step as StepType } from '../../types';
import './style.scss';

const StepContent = () => {
	const siteSlug = useSiteSlugParam();

	return (
		<div className="migration-support-instructions__list">
			<FlowCard
				className="migration-support-instructions__card"
				title={ translate( 'Explore features' ) }
				text={ translate( 'Discover the features available on WordPress.com.' ) }
				onClick={ () => redirect( `/home/${ siteSlug }` ) }
			/>

			<FlowCard
				className="migration-support-instructions__card"
				title={ translate( 'Learn about WordPress.com' ) }
				text={ translate(
					'Access guides and tutorials to better understand how to use WordPress.com.'
				) }
				onClick={ () => redirect( '/support' ) }
			/>
		</div>
	);
};

export const SiteMigrationSupportInstructions: StepType = ( { stepName, flow } ) => {
	const translate = useTranslate();
	const user = useSelector( getCurrentUser ) as UserData;
	const [ query ] = useSearchParams();
	const variation = query.get( 'variation' ) || 'default';
	const siteSlug = query.get( 'siteSlug' ) || '';
	const fromUrl = query.get( 'from' ) || '';
	const locale = useLocale();

	const subHeaderOptions = useMemo(
		() => ( {
			default: translate(
				'We apologize for the problems you’re running into. Our Happiness Engineers will reach out to you shortly at {{strong}}%(email)s{{/strong}} to help you figure out your next steps together.',
				{
					args: {
						email: user.email!,
					},
					components: {
						strong: <strong />,
					},
				}
			),
			goals_shared: translate(
				'Thanks for sharing your goals. Our Happiness Engineers will reach out to you shortly at {{strong}}%(email)s{{/strong}} to help you figure out your next steps together.',
				{
					args: {
						email: user.email!,
					},
					components: {
						strong: <strong />,
					},
				}
			),
		} ),
		[ user.email, translate ]
	);

	const subHeaderText =
		subHeaderOptions[ variation as keyof typeof subHeaderOptions ] ?? subHeaderOptions.default;

	const { sendTicket } = useSubmitMigrationTicket();

	useEffect( () => {
		recordTracksEvent( 'wpcom_support_free_migration_request_click', {
			path: window.location.pathname,
			automated_migration: true,
		} );

		sendTicket( {
			locale,
			blog_url: siteSlug,
			from_url: fromUrl,
		} );
	}, [ sendTicket, locale, siteSlug, fromUrl ] );

	const headerText = translate( 'We’ll take it from here!' );

	const isUsingStepContainerV2 = shouldUseStepContainerV2MigrationFlow( flow );

	if ( isUsingStepContainerV2 ) {
		return (
			<>
				<DocumentHead title={ headerText } />
				<Step.CenteredColumnLayout
					columnWidth={ 8 }
					topBar={ <Step.TopBar leftElement={ null } /> }
					heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
				>
					<StepContent />
				</Step.CenteredColumnLayout>
			</>
		);
	}
	return (
		<StepContainer
			stepName={ stepName }
			hideBack
			formattedHeader={
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />
			}
			isHorizontalLayout={ false }
			stepContent={ <StepContent /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SiteMigrationSupportInstructions;
