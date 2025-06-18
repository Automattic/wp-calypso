type HelpCenterQuestionsDropdownProps = {
	questions: string[];
	onQuestionSelect: ( question: string ) => void;
};

export const HelpCenterQuestionsDropdown = ( {
	questions,
	onQuestionSelect,
}: HelpCenterQuestionsDropdownProps ) => {
	const questionButtonStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '10px 16px',
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		fontSize: 13,
		fontWeight: 500,
		textDecoration: 'none',
		transition: 'all 0.15s ease',
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
		width: '100%',
		textAlign: 'left' as const,
		color: '#2c3338',
		borderBottom: '1px solid #f6f7f8',
	};

	return (
		<div style={ { backgroundColor: '#f9f9fa', padding: '8px 0' } }>
			{ questions.map( ( question, index ) => (
				<button
					key={ index }
					style={ questionButtonStyle }
					onClick={ ( e ) => {
						e.stopPropagation();
						onQuestionSelect( question );
					} }
					onMouseEnter={ ( e ) => {
						e.currentTarget.style.backgroundColor = '#fff';
					} }
					onMouseLeave={ ( e ) => {
						e.currentTarget.style.backgroundColor = 'transparent';
					} }
					title={ question }
				>
					<div
						style={ {
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							maxWidth: '100%',
						} }
					>
						{ question }
					</div>
				</button>
			) ) }
		</div>
	);
};
