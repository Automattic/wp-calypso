import { useTranslate } from 'i18n-calypso';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import ConfirmationTask from './confirmation-task';
import { getConfirmationTasks } from './confirmation-tasks';

import './style.scss';

const TrialUpgradeConfirmation = () => {
	const translate = useTranslate();

	const tasks = getConfirmationTasks( { translate } );

	return (
		<>
			<BodySectionCssClass bodyClass={ [ 'ecommerce-trial-upgraded' ] } />
			<Main wideLayout>
				<div className="trial-upgrade-confirmation__header">
					<h1 className="trial-upgrade-confirmation__title">
						{ translate( 'Woo! Welcome to Commerce' ) }
					</h1>
					<div className="trial-upgrade-confirmation__subtitle">
						<span className="trial-upgrade-confirmation__subtitle-line">
							{ translate(
								"Your purchase has been completed and you're on the %(planName)s plan.",
								{
									args: { planName: 'Commerce' },
								}
							) }
						</span>
						<span className="trial-upgrade-confirmation__subtitle-line">
							{ translate( "Now it's time to get creative. What would you like to do next?" ) }
						</span>
					</div>
				</div>
				<div className="trial-upgrade-confirmation__tasks">
					{ tasks.map( ( task ) => (
						<ConfirmationTask key={ task.title } { ...task } />
					) ) }
				</div>
			</Main>
		</>
	);
};

export default TrialUpgradeConfirmation;
