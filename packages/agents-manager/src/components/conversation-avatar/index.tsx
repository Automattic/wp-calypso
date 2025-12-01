/**
 * ConversationAvatar Component
 * Displays avatar for different bot types (Big Sky, HE, Odie)
 */

import clsx from 'clsx';
import './style.scss';

interface ConversationAvatarProps {
	type: 'big-sky' | 'he' | 'odie';
	className?: string;
}

export default function ConversationAvatar( { type, className = '' }: ConversationAvatarProps ) {
	const fullClassName = clsx(
		'agents-manager-conversation-avatar',
		`agents-manager-conversation-avatar--${ type }`,
		className
	);

	if ( type === 'he' ) {
		// Happiness Engineer - Blue circle with WordPress icon
		return (
			<div className={ fullClassName }>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
						fill="currentColor"
					/>
					<path
						d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
						fill="currentColor"
					/>
				</svg>
			</div>
		);
	}

	// Big Sky / Odie - Gray circle with sparkle icon
	return (
		<div className={ fullClassName }>
			<svg
				width="38"
				height="38"
				viewBox="0 0 38 38"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M19 0.5C29.2173 0.5 37.5 8.78273 37.5 19C37.5 29.2173 29.2173 37.5 19 37.5C8.78273 37.5 0.5 29.2173 0.5 19C0.5 8.78273 8.78273 0.5 19 0.5Z"
					fill="#2F2F2F"
				/>
				<path
					d="M19 0.5C29.2173 0.5 37.5 8.78273 37.5 19C37.5 29.2173 29.2173 37.5 19 37.5C8.78273 37.5 0.5 29.2173 0.5 19C0.5 8.78273 8.78273 0.5 19 0.5Z"
					stroke="#464646"
				/>
				<path
					d="M26.6611 18.5224L23.3782 17.39C22.0799 16.9439 21.0561 15.9201 20.61 14.6218L19.4776 11.3389C19.3231 10.887 18.6769 10.887 18.5224 11.3389L17.39 14.6218C16.9439 15.9201 15.9201 16.9439 14.6218 17.39L11.3389 18.5224C10.887 18.6769 10.887 19.3231 11.3389 19.4776L14.6218 20.61C15.9201 21.0561 16.9439 22.0799 17.39 23.3782L18.5224 26.6611C18.6769 27.113 19.3231 27.113 19.4776 26.6611L20.61 23.3782C21.0561 22.0799 22.0799 21.0561 23.3782 20.61L26.6611 19.4776C27.113 19.3231 27.113 18.6769 26.6611 18.5224ZM22.8291 19.2431L21.1877 19.8093C20.5357 20.0323 20.0266 20.5471 19.8036 21.1934L19.2374 22.8349C19.1573 23.0636 18.837 23.0636 18.7569 22.8349L18.1907 21.1934C17.9676 20.5414 17.4529 20.0323 16.8066 19.8093L15.1651 19.2431C14.9364 19.163 14.9364 18.8427 15.1651 18.7626L16.8066 18.1964C17.4586 17.9734 17.9676 17.4586 18.1907 16.8123L18.7569 15.1709C18.837 14.9421 19.1573 14.9421 19.2374 15.1709L19.8036 16.8123C20.0266 17.4643 20.5414 17.9734 21.1877 18.1964L22.8291 18.7626C23.0579 18.8427 23.0579 19.163 22.8291 19.2431Z"
					fill="white"
				/>
			</svg>
		</div>
	);
}
