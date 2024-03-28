export default function ReaderShareIcon( { iconSize } ) {
	return (
		<svg
			key="share"
			fill="none"
			className="reader-share"
			viewBox="0 0 20 20"
			width={ iconSize }
			height={ iconSize }
			xmlns="http://www.w3.org/2000/svg"
		>
			<clipPath id="share-icon-a">
				<path d="m0 0h20v20h-20z" />
			</clipPath>
			<g clipPath="url(#share-icon-a)">
				<path
					d="m11.8666 6.79996v-3.79996l6.8 6.64993-6.8 6.64997v-3.8s-10.19997-.8844-10.19997 4.5001c0-10.77003 10.19997-10.20004 10.19997-10.20004z"
					stroke="#646970"
					strokeLinecap="round"
					strokeWidth="1.5"
				/>
			</g>
		</svg>
	);
}
