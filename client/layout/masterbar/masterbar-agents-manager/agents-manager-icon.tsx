interface AgentsManagerIconProps {
	hasUnread: boolean;
}

// AI "sparkle" mark for the Agents Manager masterbar launcher, so it reads as a
// distinct AI surface rather than sharing the Help Center's question-mark icon.
export const AgentsManagerIcon: React.FC< AgentsManagerIconProps > = ( { hasUnread } ) => {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12 1.5L14.3 8.2C14.5 8.8 15 9.3 15.6 9.5L22.5 12L15.6 14.5C15 14.7 14.5 15.2 14.3 15.8L12 22.5L9.7 15.8C9.5 15.2 9 14.7 8.4 14.5L1.5 12L8.4 9.5C9 9.3 9.5 8.8 9.7 8.2L12 1.5Z"
				fill="var( --color-masterbar-icon, currentColor )"
			/>
			{ hasUnread && (
				<circle cx="20" cy="3.5" r="4.3" fill="#e65054" stroke="#1d2327" strokeWidth="2" />
			) }
		</svg>
	);
};

export default AgentsManagerIcon;
