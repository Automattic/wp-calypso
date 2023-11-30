import { CircularProgressBar } from '@automattic/components';
import { Launchpad } from '@automattic/launchpad';
import i18n, { useTranslate } from 'i18n-calypso';
import { useSubscriberLaunchpadTasks } from 'calypso/my-sites/subscribers/hooks';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './styles.scss';

const SubscriberLaunchpad = ( {
	launchpadContext = 'subscriber-list',
}: {
	launchpadContext: string;
} ) => {
	const { checklistSlug, taskFilter, numberOfSteps, completedSteps } =
		useSubscriberLaunchpadTasks();
	const translate = useTranslate();
	const site = useSelector( ( state ) => getSelectedSite( state ) );

	return (
		<div className="subscriber-launchpad">
			<div className="subscriber-launchpad__header">
				<div>
					<h2 className="subscriber-launchpad__title">{ translate( 'No subscribers yet?' ) }</h2>
					<p className="subscriber-launchpad__description">
						{ translate( 'Follow these steps to get started.' ) }
					</p>
				</div>
				<div className="subscriber-launchpad__progress-bar-container">
					<CircularProgressBar
						size={ 40 }
						enableDesktopScaling
						numberOfSteps={ numberOfSteps }
						currentStep={ completedSteps }
					/>
				</div>
			</div>

			<Launchpad
				siteSlug={ site?.slug ?? null }
				checklistSlug={ checklistSlug }
				onPostFilterTasks={ taskFilter }
				launchpadContext={ launchpadContext }
			/>
		</div>
	);
};

SubscriberLaunchpad.hasTranslationsAvailable = ( locale: string ) => {
	return (
		locale.startsWith( 'en' ) ||
		( i18n.hasTranslation( 'No subscribers yet?' ) &&
			i18n.hasTranslation( 'Follow these steps to get started.' ) )
	);
};

export default SubscriberLaunchpad;
