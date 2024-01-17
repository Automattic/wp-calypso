import { MigrationStatusError } from '@automattic/data-stores';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import useErrorTitle from './use-error-title';

interface Props {
	status: MigrationStatusError;
	resetMigration: () => void;
}

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
