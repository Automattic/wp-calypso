import './style.scss';

type SubscriberProfileProps = {
	avatar: string;
	displayName: string;
	email: string;
	compact?: boolean;
};

const SubscriberProfile = ( {
	avatar,
	displayName,
	email,
	compact = true,
}: SubscriberProfileProps ) => {
	// When adding a click event for this, make sure to also track it
	// import { useRecordSubscriberClicked } from '../../tracks';
	// const recordSubscriberClicked = useRecordSubscriberClicked();
	// recordSubscriberClicked( 'title', { } ); & recordSubscriberClicked( 'icon', { } );
	return (
		<div className={ `subscriber-profile ${ compact ? 'subscriber-profile--compact' : '' }` }>
			<img src={ avatar } className="subscriber-profile__user-image" alt="Profile pic" />
			<div className="subscriber-profile__user-details">
				<span className="subscriber-profile__name">{ displayName }</span>
				{ email && email !== displayName && (
					<span className="subscriber-profile__email">{ email }</span>
				) }
			</div>
		</div>
	);
};

export default SubscriberProfile;
