import clsx from 'clsx';

export default function ReaderCommentIcon( { iconSize } ) {
	const className = clsx( 'comment-button__icon', {
		'needs-offset-x': iconSize % 18 === 0,
		'reader-comment': true,
	} );

	return (
		<svg
			key="comment"
			fill="none"
			viewBox="0 0 20 20"
			width={ iconSize }
			height={ iconSize }
			className={ className }
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="m12.5278 14.5556v-.75h-.75-8.00002c-.56801 0-1.02778-.4598-1.02778-1.0278v-8.00002c0-.56801.45977-1.02778 1.02778-1.02778h12.44442c.568 0 1.0278.45977 1.0278 1.02778v7.94842c0 .9051-.4384 1.7561-1.1748 2.2822l-3.5474 2.5341z"
				fill="#fff"
				stroke="#646970"
				strokeWidth="1.5"
			/>
		</svg>
	);
}
