export const SubscriberProfile = ( {
	avatar,
	displayName,
	email,
}: {
	avatar: string;
	displayName: string;
	email: string;
} ) => {
	return (
		<div className="subscriber-profile">
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
