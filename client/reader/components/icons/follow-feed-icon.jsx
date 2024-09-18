export default function ReaderFollowFeedIcon( { iconSize } ) {
	return (
		<svg
			key="follow"
			className="reader-follow-feed"
			fill="none"
			viewBox="0 0 20 20"
			width={ iconSize }
			height={ iconSize }
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M1 5C1 3.89543 1.89543 3 3 3H17C18.1046 3 19 3.89543 19 5V15C19 16.1046 18.1046 17 17 17H3C1.89543 17 1 16.1046 1 15V5ZM3 4.5H17C17.2761 4.5 17.5 4.72386 17.5 5V5.93754L10 11.5625L2.5 5.93746V5C2.5 4.72386 2.72386 4.5 3 4.5ZM2.5 7.81246V15C2.5 15.2761 2.72386 15.5 3 15.5H17C17.2761 15.5 17.5 15.2761 17.5 15V7.81254L10 13.4375L2.5 7.81246Z"
			/>
		</svg>
	);
}
