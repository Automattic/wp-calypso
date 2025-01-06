import { helpFilled } from '@wordpress/icons';

interface HelpCenterIconProps {
	hasUnread: boolean;
}
export const HelpCenterIcon: React.FC< HelpCenterIconProps > = ( { hasUnread } ) => {
	if ( hasUnread ) {
		return (
			<svg
				width="25"
				height="24"
				viewBox="0 0 25 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM13 18H11V16H13V18ZM13 13.859V15H11V13C11 12.448 11.448 12 12 12C13.103 12 14 11.103 14 10C14 8.897 13.103 8 12 8C10.897 8 10 8.897 10 10H8C8 7.791 9.791 6 12 6C14.209 6 16 7.791 16 10C16 11.862 14.722 13.413 13 13.859Z"
					fill="var( --color-masterbar-icon )"
				/>
				<circle cx="20" cy="3.5" r="4.3" fill="#e65054" stroke="#1d2327" strokeWidth="2" />
			</svg>
		);
	}
	return helpFilled;
};
export default HelpCenterIcon;
