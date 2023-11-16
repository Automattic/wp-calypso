import './style.scss';
import { ExternalLink } from '@wordpress/components';

type SubscriberProfileProps = {
	avatar: string;
	displayName: string;
	email: string;
	compact?: boolean;
	url?: string;
};

const SubscriberProfile = ( {
	avatar,
	displayName,
	email,
	compact = true,
	url,
}: SubscriberProfileProps ) => {
	// When adding a click event for this, make sure to also track it
	// import { useRecordSubscriberClicked } from '../../tracks';
	// const recordSubscriberClicked = useRecordSubscriberClicked();
	// recordSubscriberClicked( 'title', { } ); & recordSubscriberClicked( 'icon', { } );
	return (
		<div className={ `subscriber-profile ${ compact ? 'subscriber-profile--compact' : '' }` }>
			<img src={ avatar } className="subscriber-profile__user-image" alt="Profile pic" />
			<div className="subscriber-profile__user-details">
				{ url ? (
					<ExternalLink className="subscriber-profile__name" href={ url }>
						{ displayName }
					</ExternalLink>
				) : (
					<span className="subscriber-profile__name">{ displayName }</span>
				) }
				{ email && email !== displayName && (
					<span className="subscriber-profile__email">{ email }</span>
				) }
			</div>
		</div>
	);
};

export default SubscriberProfile;
