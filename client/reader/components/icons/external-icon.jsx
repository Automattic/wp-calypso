export default function ReaderExternalIcon( { iconSize } ) {
	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			width={ iconSize }
			height={ iconSize }
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="m0 0h20v20h-20z" fill="#fff" />
			<path
				clipRule="evenodd"
				d="m11.3764 2.01611h.75 5.1075.75v.75 5.10749.75h-1.5v-.75-3.2968l-5.8701 5.8701-.5303.5303-1.0607-1.06062.53032-.53033 5.87008-5.87014h-3.2968-.75zm-6.3764 3.48389h4v-1.5h-4c-1.10457 0-2 .89543-2 2v9c0 1.1046.89543 2 2 2h9c1.1046 0 2-.8954 2-2v-4h-1.5v4c0 .2761-.2239.5-.5.5h-9c-.27614 0-.5-.2239-.5-.5v-9c0-.27614.22386-.5.5-.5z"
				fill="#646970"
				fillRule="evenodd"
			/>
		</svg>
	);
}
