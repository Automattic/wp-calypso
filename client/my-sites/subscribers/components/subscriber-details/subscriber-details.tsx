import { Subscriber } from '../../types';
import { SubscriberProfile } from '../subscriber-profile';

type SubscriberDetailsProps = {
	subscriber: Subscriber;
};

const SubscriberDetails = ( { subscriber }: SubscriberDetailsProps ) => {
	const { avatar, display_name, email_address } = subscriber;

	return (
		<div className="subscriber-details">
			<div className="subscriber-details__header">
				<SubscriberProfile
					avatar={ avatar }
					displayName={ display_name }
					email={ email_address }
					compact={ false }
				/>
			</div>
			<div className="subscriber-details__content"></div>
		</div>
	);
};

export default SubscriberDetails;
