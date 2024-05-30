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
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M19.1328,10.7051c0.0832,0.4607,0.1246,0.9356,0.1161,1.4214c-0.0699,4.0034-3.372,7.1922-7.3754,7.1224 c-4.0035-0.0699-7.1922-3.372-7.1224-7.3754C4.821,7.87,8.1231,4.6812,12.1265,4.7511c0.9278,0.0162,1.8086,0.2125,2.6185,0.5444 c0.192-0.4829,0.4729-0.9163,0.8257-1.2848c-1.0456-0.4679-2.2002-0.7381-3.418-0.7594c-4.8318-0.0843-8.817,3.7642-8.9014,8.596 c-0.0843,4.8317,3.7642,8.817,8.596,8.9014c4.8317,0.0843,8.817-3.7642,8.9014-8.596c0.0119-0.6831-0.0626-1.3463-0.1996-1.9869 C20.1223,10.4297,19.6452,10.6169,19.1328,10.7051z" />
					<rect x="11.1606" y="15.1716" width="1.5557" height="1.5557" />
					<path d="M12.7163,13.2702c2.4199-0.605,3.1113-3.8027,1.1235-5.3584S9,7.8254,9,10.3317h1.5557 c0-0.8643,0.6914-1.5557,1.5557-1.5557c1.9014,0,2.0742,2.7656,0.1729,3.0249c-0.4321,0-0.9507,0.4321-0.9507,1.0371v1.2964h1.5557 v-0.8643H12.7163z" />
					<circle
						cx="18.5"
						cy="6.5"
						r="3"
						fill="var( --color-masterbar-unread-dot-background, #e26f56 )"
					/>
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
