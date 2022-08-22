// We are using this temporarily for testing purposes of the main Dialog

const Icon = () => (
	<svg
		width="24"
		height="24"
		xmlns="http://www.w3.org/2000/svg"
		fillRule="evenodd"
		clipRule="evenodd"
	>
		<path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11zm.053 17c.466 0 .844-.378.844-.845 0-.466-.378-.844-.844-.844-.466 0-.845.378-.845.844 0 .467.379.845.845.845zm.468-2.822h-.998c-.035-1.162.182-2.054.939-2.943.491-.57 1.607-1.479 1.945-2.058.722-1.229.077-3.177-2.271-3.177-1.439 0-2.615.877-2.928 2.507l-1.018-.102c.28-2.236 1.958-3.405 3.922-3.405 1.964 0 3.615 1.25 3.615 3.22 0 1.806-1.826 2.782-2.638 3.868-.422.563-.555 1.377-.568 2.09z" />
	</svg>
);

type Props = {
	onClick?: React.MouseEventHandler;
};

const HintButton: React.FC< Props > = ( { onClick } ) => {
	return (
		<button
			type="button"
			style={ { position: 'absolute', bottom: 0, right: '20px' } }
			aria-haspopup
			onClick={ onClick }
		>
			<Icon />
		</button>
	);
};

export default HintButton;
