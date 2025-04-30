import { Step, StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import User from './user';

export const SignupPage = ( props: {
	initialContext: { query: Record< string, string >; hash: Record< string, string > };
} ) => {
	const translate = useTranslate();

	// We can define this depending on the `redirect_to` URL for instance. One day this will be the default.
	const isStepContainerV2 = !! props.initialContext.query.stepContainerV2;

	return (
		<User
			{ ...props }
			isSocialFirst
			onSubmit={ ( ...result ) => {
				console.log( result );
			} }
		>
			{ ( { goBack, children, headerText, subHeaderText, loginLink } ) => {
				if ( isStepContainerV2 ) {
					return (
						<Step.CenteredColumnLayout
							className="step-container-v2--user"
							verticalAlign="center"
							columnWidth={ 4 }
							heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
							topBar={
								<Step.TopBar
									leftElement={ goBack ? <Step.BackButton href={ goBack } /> : undefined }
									rightElement={
										<Step.LinkButton href={ loginLink }>{ translate( 'Log in' ) }</Step.LinkButton>
									}
								/>
							}
						>
							{ children }
						</Step.CenteredColumnLayout>
					);
				}

				return (
					<StepContainer
						stepName="account"
						isHorizontalLayout={ false }
						isWideLayout={ false }
						isFullLayout
						isLargeSkipLayout={ false }
						hideBack={ ! goBack }
						goBack={ goBack }
						formattedHeader={
							<FormattedHeader
								align="center"
								headerText={ headerText }
								subHeaderText={ subHeaderText }
							/>
						}
						stepContent={ children }
						recordTracksEvent={ recordTracksEvent }
						customizedActionButtons={
							<Button
								className="step-wrapper__navigation-link forward"
								href={ loginLink }
								variant="link"
							>
								<span>{ translate( 'Log in' ) }</span>
							</Button>
						}
					/>
				);
			} }
		</User>
	);
};
