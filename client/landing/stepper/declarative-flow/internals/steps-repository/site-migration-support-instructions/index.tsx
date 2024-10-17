import { recordTracksEvent } from '@automattic/calypso-analytics';
import { StepContainer } from '@automattic/onboarding';
import { translate, useTranslate } from 'i18n-calypso';
import { useSearchParams } from 'react-router-dom';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { UserData } from 'calypso/lib/user/user';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import FlowCard from '../components/flow-card';
import { redirect } from '../import/util';
import type { Step } from '../../types';

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

export const SiteMigrationSupportInstructions: Step = ( { stepName } ) => {
	const translate = useTranslate();
	const user = useSelector( getCurrentUser ) as UserData;
	const [ query ] = useSearchParams();
	const variation = query.get( 'variation' ) || 'default';

	const contentVariation = {
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
	};

	const content =
		contentVariation[ variation as keyof typeof contentVariation ] ?? contentVariation.default;

	return (
		<StepContainer
			stepName={ stepName }
			hideBack
			formattedHeader={
				<FormattedHeader
					headerText={ translate( 'We’ll take it from here!' ) }
					subHeaderText={ content }
					subHeaderAlign="center"
				/>
			}
			isHorizontalLayout={ false }
			stepContent={ <StepContent /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SiteMigrationSupportInstructions;
