export default function ReaderFollowConversationIcon( { iconSize } ) {
	return (
		<svg
			key="follow-conversation"
			fill="none"
			viewBox="0 0 24 24"
			width={ iconSize }
			height={ iconSize }
			className="reader-follow-conversation"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				d="M12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z"
				clipRule="evenodd"
			/>
			<path d="M11.25 12.75v3h1.5v-3h3v-1.5h-3v-3h-1.5v3h-3v1.5h3Z" />
		</svg>
	);
}
