export default function ReaderFollowingConversationIcon( { iconSize } ) {
	return (
		<svg
			key="following-conversation"
			fill="none"
			viewBox="0 0 20 20"
			width={ iconSize }
			height={ iconSize }
			className="reader-following-conversation"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m12.2778 14.5556v-.75h-.75-8.00002c-.56801 0-1.02778-.4598-1.02778-1.0278v-8.00002c0-.56801.45977-1.02778 1.02778-1.02778h12.44442c.568 0 1.0278.45977 1.0278 1.02778v7.94842c0 .9051-.4384 1.7561-1.1748 2.2822l-3.5474 2.5341z"
				fill="#fff"
				stroke="#008a20"
				strokeWidth="1.5"
			/>
			<path d="m10.5 6.5h4v3.5h4.5v-8h-8.5z" fill="#fff" className="status" />
			<g stroke="#008a20">
				<path d="m5.625 6.875h7.25v.75h-7.25z" strokeWidth=".75" />
				<path d="m5.625 9.875h3.25v.75h-3.25z" strokeWidth=".75" />
				<path d="m14 4 2 2 3.5-3.5" strokeWidth="1.5" />
			</g>
		</svg>
	);
}
