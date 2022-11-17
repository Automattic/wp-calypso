import { useSelect } from '@wordpress/data';
import { HELP_CENTER_STORE } from '../stores';

interface Props {
	newItems: boolean;
}

const HelpIcon = ( { newItems }: Props ) => {
	const unreadCount = useSelect( ( select ) => select( HELP_CENTER_STORE ).getUnreadCount() );
	return (
		<>
			{ newItems || unreadCount > 0 ? (
				<svg width="24" height="24" viewBox="0 -2 28 24" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0ZM11 16H9V14H11V16ZM11 11.859V13H9V11C9 10.448 9.448 10 10 10C11.103 10 12 9.103 12 8C12 6.897 11.103 6 10 6C8.897 6 8 6.897 8 8H6C6 5.791 7.791 4 10 4C12.209 4 14 5.791 14 8C14 9.862 12.722 11.413 11 11.859Z"
						fill="var(--color-masterbar-text)"
					/>
					<circle
						cx="20"
						cy="4"
						r="5"
						fill="var( --color-masterbar-unread-dot-background )"
						stroke="#101517"
						strokeWidth="2"
					/>
				</svg>
			) : (
				<svg width="24" height="24" viewBox="0 -2 24 24" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0ZM11 16H9V14H11V16ZM11 11.859V13H9V11C9 10.448 9.448 10 10 10C11.103 10 12 9.103 12 8C12 6.897 11.103 6 10 6C8.897 6 8 6.897 8 8H6C6 5.791 7.791 4 10 4C12.209 4 14 5.791 14 8C14 9.862 12.722 11.413 11 11.859Z"
						fill="var(--color-masterbar-text)"
					/>
				</svg>
			) }
		</>
	);
};

export default HelpIcon;
