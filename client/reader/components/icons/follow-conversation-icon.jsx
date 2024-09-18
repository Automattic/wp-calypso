export default function ReaderFollowConversationIcon( { iconSize } ) {
	return (
		<svg
			key="follow-conversation"
			fill="none"
			viewBox="0 0 20 20"
			width={ iconSize }
			height={ iconSize }
			className="reader-follow-conversation"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M17 4.5V7H15.5V4.5H13V3H15.5V0.5H17V3H19.5V4.5H17ZM17 16.125V11H15.5V15.625H3.68822L2.5 16.8145V4.5H9V3H2C1.44772 3 1 3.44772 1 4V18.5247C1 18.8173 1.16123 19.086 1.41935 19.2237C1.72711 19.3878 2.10601 19.3313 2.35252 19.0845L4.31 17.125H16C16.5523 17.125 17 16.6773 17 16.125ZM5 7.5V9H13V7.5H5ZM10 13H5V11.5H10V13Z"
			/>
		</svg>
	);
}
