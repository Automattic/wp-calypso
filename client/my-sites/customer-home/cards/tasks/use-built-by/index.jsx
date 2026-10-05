import { WordPressLogo } from '@automattic/components';
import { TASK_USE_BUILT_BY } from 'calypso/my-sites/customer-home/cards/constants';
import useMyHomeDifmOffer from 'calypso/my-sites/customer-home/cards/features/difm-offer/use-my-home-difm-offer';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

import './style.scss';

const UseBuiltBy = () => {
	// The free DIFM offer card replaces this paid DIFM promotion when it shows.
	const { copy: difmOfferCopy } = useMyHomeDifmOffer();
	const isReplacedByDifmOffer = !! difmOfferCopy;

	UseBuiltBy.isDisabled = isReplacedByDifmOffer;

	if ( isReplacedByDifmOffer ) {
		return null;
	}

	return (
		<Task
			title="Get expert help for your website"
			description="Whether you want to create an online store, redesign your website, migrate your site or simply showcase your work — we are happy to help."
			actionText="Get Started"
			actionUrl="https://wordpress.com/website-design-service/?ref=my-home-card"
			illustration={ <WordPressLogo size={ 96 } className="use-built-by__logo" /> }
			taskId={ TASK_USE_BUILT_BY }
		/>
	);
};

export default UseBuiltBy;
