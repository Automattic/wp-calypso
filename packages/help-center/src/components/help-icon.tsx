interface Props {
	newItems: boolean;
	active: boolean;
}

const HelpIcon: React.FC< Props > = ( { newItems, active } ) => (
	<svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle
			cx="12"
			cy="12.5"
			r="8"
			stroke={ active ? 'white' : '#1e1e1e' }
			fill={ active ? '#1e1e1e' : 'white' }
			strokeWidth="1.5"
		/>
		<path
			d="M9.75 10.75C9.75 9.50736 10.7574 8.5 12 8.5C13.2426 8.5 14.25 9.50736 14.25 10.75C14.25 11.9083 13.3748 12.8621 12.2496 12.9863C12.1124 13.0015 12 13.1119 12 13.25V14.5"
			stroke={ active ? 'white' : '#1e1e1e' }
			strokeWidth="1.5"
			fill="none"
		/>
		<path d="M12 15.5V17" stroke={ active ? 'white' : '#1e1e1e' } strokeWidth="1.5" />
		{ newItems && (
			<circle
				cx="20"
				cy="8"
				r="5"
				fill="var( --color-masterbar-unread-dot-background )"
				strokeWidth="2"
			/>
		) }
	</svg>
);

export default HelpIcon;
