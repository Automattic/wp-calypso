import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import januaryBumpIllustration from 'calypso/assets/images/customer-home/illustration--january-bump.png';
import { TASK_JANUARY_BUMP } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

import './style.scss';

const JanuaryBump = () => {
	const translate = useTranslate();

	const title = translate( 'Start That ‘Someday Project’ Now' );
	const description = translate(
		'Whatever your New Year’s resolutions are—from starting a newsletter to taking on the world with a bold new business—tap into the powerful platform that’s here to help you make it happen sooner.'
	);

	return (
		<Task
			customClass="task__january-bump"
			title={ title }
			description={ description }
			actionText={ translate( 'Start today' ) }
			actionUrl={ localizeUrl(
				'https://wordpress.com/pricing/start-your-someday-project?ref=my-home-card'
			) }
			completeOnStart={ false }
			illustration={ januaryBumpIllustration }
			taskId={ TASK_JANUARY_BUMP }
		/>
	);
};

export default JanuaryBump;
