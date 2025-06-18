import { Spinner } from '@wordpress/components';

interface HelpCenterAskAIButtonProps {
	isLoadingQuestions: boolean;
	showQuestions: boolean;
	hasDocumentation: boolean;
	onClick: () => void;
}

export const HelpCenterAskAIButton = ( {
	isLoadingQuestions,
	showQuestions,
	hasDocumentation,
	onClick,
}: HelpCenterAskAIButtonProps ) => {
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
		width: '100%',
		textAlign: 'left' as const,
	};

	const askAIButtonStyle: React.CSSProperties = {
		...buttonBaseStyle,
		color: '#3858e9',
		borderBottom: hasDocumentation || showQuestions ? '1px solid #f0f0f0' : 'none',
		justifyContent: 'space-between',
	};

	return (
		<button
			style={ askAIButtonStyle }
			onClick={ ( e ) => {
				e.stopPropagation();
				onClick();
			} }
			disabled={ isLoadingQuestions }
			onMouseEnter={ ( e ) => {
				if ( ! isLoadingQuestions ) {
					e.currentTarget.style.backgroundColor = '#f6f7ff';
				}
			} }
			onMouseLeave={ ( e ) => {
				e.currentTarget.style.backgroundColor = 'transparent';
			} }
			title="Get AI assistance with selected text"
		>
			<div style={ { display: 'flex', alignItems: 'center', gap: 8 } }>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 2L15.09 8.26L22 9L17 14.74L18.18 21.02L12 17.77L5.82 21.02L7 14.74L2 9L8.91 8.26L12 2Z"
						fill="#3858e9"
					/>
				</svg>
				Ask in Help Center (AI)
			</div>

			{ isLoadingQuestions ? (
				<Spinner style={ { width: '16px', height: '16px' } } />
			) : (
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					style={ {
						transform: showQuestions ? 'rotate(180deg)' : 'rotate(0deg)',
						transition: 'transform 0.2s ease',
					} }
				>
					<path d="M7 10L12 15L17 10H7Z" fill="#3858e9" />
				</svg>
			) }
		</button>
	);
};
