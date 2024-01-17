import { MigrationStatusError } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import useErrorTitle from './use-error-title';
import './style.scss';

interface Props {
	status: MigrationStatusError;
	resetMigration: () => void;
}

export const MigrationErrorHint = () => {
	const translate = useTranslate();
	const jetpackSupportUrl = localizeUrl(
		'https://jetpack.com/support/getting-started-with-jetpack/'
	);
	const wordPressSupportUrl = localizeUrl(
		'https://wordpress.com/support/invite-people/user-roles/#administrator'
	);

	return (
		<div className="migration-error--hint">
			<p>{ translate( 'To continue, please:' ) }</p>
			<ol>
				<li>
					{ translate(
						'Please ensure the {{a}}Jetpack plugin is active and connected{{/a}} on the source website.',
						{
							components: {
								a: <a href={ jetpackSupportUrl } />,
							},
						}
					) }
				</li>
				<li>
					{ translate(
						'{{a}}Check that your WordPress.com account exists{{/a}} as administrator.',
						{
							components: {
								a: <a href={ wordPressSupportUrl } />,
							},
						}
					) }
				</li>
				<li>{ translate( 'Try again or contact our Happiness Engineers' ) }</li>
			</ol>
		</div>
	);
};

export const MigrationError = ( props: Props ) => {
	const translate = useTranslate();
	const { status, resetMigration } = props;
	const title = useErrorTitle( status );

	return (
		<div className="import__heading import__heading-center">
			<Title>{ translate( "We couldn't complete your migration" ) }</Title>
			<SubTitle>
				{ title }
				<br />
				{ translate( 'Please try again soon or contact support for help.' ) }
			</SubTitle>
			<div className="import__buttons-group">
				<NextButton onClick={ resetMigration }>{ translate( 'Try again' ) }</NextButton>
			</div>
		</div>
	);
};

export default MigrationError;
