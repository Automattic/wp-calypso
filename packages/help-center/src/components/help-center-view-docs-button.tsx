type HelpCenterViewDocsButtonProps = {
	onClick: () => void;
};

export const HelpCenterViewDocsButton = ( { onClick }: HelpCenterViewDocsButtonProps ) => {
	// TODO: Move styles to a CSS file or styled component
	const buttonBaseStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '12px 16px',
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		fontSize: 14,
		fontWeight: 500,
		textDecoration: 'none',
		transition: 'all 0.15s ease',
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
		width: '100%',
		textAlign: 'left' as const,
		color: '#646970',
	};

	return (
		<button
			style={ buttonBaseStyle }
			onClick={ onClick }
			onMouseEnter={ ( e ) => {
				e.currentTarget.style.backgroundColor = '#f6f7f8';
			} }
			onMouseLeave={ ( e ) => {
				e.currentTarget.style.backgroundColor = 'transparent';
			} }
			title="View related documentation"
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
					fill="#646970"
				/>
			</svg>
			View Docs
		</button>
	);
};
