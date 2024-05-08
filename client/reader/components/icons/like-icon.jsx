import clsx from 'clsx';

export default function ReaderLikeIcon( { liked, iconSize } ) {
	const className = clsx( {
		'needs-offset': iconSize % 18 === 0,
		'reader-star': true,
	} );
	if ( ! iconSize ) {
		iconSize = 20;
	}
	return (
		<span className="like-button__like-icons">
			<svg
				key="like"
				fill="none"
				height={ iconSize }
				className={ className }
				viewBox="0 0 20 20"
				width={ iconSize }
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="m10.0001 2.5 2.4463 5.33517h5.4704l-4.5834 4.23893 1.5592 5.4259-4.8925-2.8125-4.8925 2.8125 1.55917-5.4259-4.58333-4.23893h2.7352 2.73521z"
					stroke={ liked ? 'var(--color-primary)' : '#646970' }
					strokeLinecap="round"
					strokeWidth="1.5"
				/>
			</svg>
		</span>
	);
}
