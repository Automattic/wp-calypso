import { useTranslate } from 'i18n-calypso';
import Main from 'calypso/components/main';
import './style.scss';
import ConfirmationTask from './confirmation-task';
import { getConfirmationTasks } from './confirmation-tasks';

const TrialUpgradeConfirmation = () => {
	const translate = useTranslate();

	const tasks = getConfirmationTasks( { translate } );

	return (
		<Main wideLayout>
			<div className="trial-upgrade-confirmation__header">
				<h1 className="trial-upgrade-confirmation__title">
					{ translate( 'Woo! Welcome to eCommerce' ) }
				</h1>
				<div className="trial-upgrade-confirmation__subtitle">
					{ translate( 'Your purchase has been completed and you’re on the Commerce plan.' ) }
					<br />
					{ translate( "Now it's time to get creative. What would you like to do next?" ) }
				</div>
			</div>
			<div className="trial-upgrade-confirmation__tasks">
				{ tasks.map( ( task ) => (
					<ConfirmationTask { ...task } />
				) ) }
			</div>
		</Main>
	);
};

export default TrialUpgradeConfirmation;
