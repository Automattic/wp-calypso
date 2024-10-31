import { useSelect } from '@wordpress/data';
import { forwardRef } from 'react';
import { HELP_CENTER_STORE } from '../stores';
import type { HelpCenterSelect } from '@automattic/data-stores';

type CoreDataPlaceholder = {
	hasFinishedResolution: ( ...args: unknown[] ) => boolean;
};

const HelpIcon = forwardRef< SVGSVGElement >( ( _, ref ) => {
	const { unreadCount, doneLoading, hasSeenWhatsNewModal } = useSelect(
		( select ) => ( {
			unreadCount: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getUnreadCount(),
			doneLoading: ( select( 'core/data' ) as CoreDataPlaceholder ).hasFinishedResolution(
				HELP_CENTER_STORE,
				'getHasSeenWhatsNewModal',
				[]
			),
			hasSeenWhatsNewModal: (
				select( HELP_CENTER_STORE ) as HelpCenterSelect
			 ).getHasSeenWhatsNewModal(),
		} ),
		[]
	);

	const newItems = doneLoading && ! hasSeenWhatsNewModal;

	return (
		<>
			{ newItems || unreadCount > 0 ? (
				<svg
					className="help-center__icon-has-new-items"
					ref={ ref }
					width="25"
					height="24"
					viewBox="0 0 25 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M12 4.75a7.25 7.25 0 100 14.5 7.25 7.25 0 000-14.5zM3.25 12a8.75 8.75 0 1117.5 0 8.75 8.75 0 01-17.5 0zM12 8.75a1.5 1.5 0 01.167 2.99c-.465.052-.917.44-.917 1.01V14h1.5v-.845A3 3 0 109 10.25h1.5a1.5 1.5 0 011.5-1.5zM11.25 15v1.5h1.5V15h-1.5z" />
					<circle cx="20" cy="5" r="4" fill="#e65054" stroke="#101517" strokeWidth="1" />
				</svg>
			) : (
				<svg
					className="help-center__icon"
					ref={ ref }
					width="24"
					height="24"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M12 4.75a7.25 7.25 0 100 14.5 7.25 7.25 0 000-14.5zM3.25 12a8.75 8.75 0 1117.5 0 8.75 8.75 0 01-17.5 0zM12 8.75a1.5 1.5 0 01.167 2.99c-.465.052-.917.44-.917 1.01V14h1.5v-.845A3 3 0 109 10.25h1.5a1.5 1.5 0 011.5-1.5zM11.25 15v1.5h1.5V15h-1.5z" />
				</svg>
			) }
		</>
	);
} );

export default HelpIcon;
