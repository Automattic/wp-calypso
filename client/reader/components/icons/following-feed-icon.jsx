export default function ReaderFollowingFeedIcon( { iconSize } ) {
	return (
		<svg
			key="following"
			className="reader-following-feed"
			fill="none"
			viewBox="0 0 20 20"
			width={ iconSize }
			height={ iconSize }
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				clipRule="evenodd"
				d="m16 4.5h-12v10.5c0 .2761.22386.5.5.5h7v1.5h-7c-1.10457 0-2-.8954-2-2v-10.5-1.5h1.5 12 1.5v1.5 8h-1.5zm-10.5 2h9v1.5h-9zm0 3h4v1.5h-4zm6.5 1.5h1v1h-1zm-1.5-1.5h1.5 1 1.5v1.5 1 1.5h-1.5-1-1.5v-1.5-1zm-5 2.5h4v1.5h-4z"
				fill="#606a73"
				fillRule="evenodd"
			/>
			<path d="m13.5 16 2 2 3.5-3.5" stroke="#008a20" strokeWidth="1.5" />
		</svg>
	);
}
