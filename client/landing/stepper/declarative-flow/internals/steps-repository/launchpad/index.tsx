import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import LaunchpadList from './list';
import LaunchpadPreview from './preview';
import type { Step } from '../../types';

import './style.scss';

const tasks = [
	{
		id: 101,
		isCompleted: true,
		linkTo: '#',
		title: 'Free Plan',
	},
	{
		id: 102,
		isCompleted: true,
		linkTo: '#',
		title: 'Set up Newsletter',
	},
	{
		id: 103,
		isCompleted: false,
		linkTo: '#',
		title: 'Add Subscribers',
	},
];

const Launchpad: Step = ( { navigation } ) => {
	const translate = useTranslate();
	const almostReadyToLaunchText = translate( 'Voilà! Your Newsletter is up and running' );

	const stepContent = (
		<div className="launchpad">
			<LaunchpadList tasks={ tasks } />
			<LaunchpadPreview />
		</div>
	);

	return (
		<>
			<DocumentHead title={ almostReadyToLaunchText } />
			<StepContainer
				stepName={ 'launchpad' }
				goNext={ navigation.goNext }
				skipLabelText={ translate( 'Go to Admin' ) }
				skipButtonAlign={ 'top' }
				hideBack={ true }
				stepContent={ stepContent }
				formattedHeader={
					<FormattedHeader
						id={ 'launchpad-header' }
						headerText={ <>{ almostReadyToLaunchText }</> }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default Launchpad;
