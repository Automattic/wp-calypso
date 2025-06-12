import { Icon, Button } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { useDownloadSubscribersCSV } from '../../hooks';
import useSubscriberCountQuery from '../../queries/use-subscriber-count-query';
import '../shared/popover-style.scss';

type SubscribersHeaderPopoverProps = {
	siteId: number | null;
	openMigrateSubscribersModal: () => void;
};

const SubscribersHeaderPopover = ( {
	siteId,
	openMigrateSubscribersModal,
}: SubscribersHeaderPopoverProps ) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const onToggle = useCallback( () => setIsVisible( ( visible ) => ! visible ), [] );
	const buttonRef = useRef< HTMLButtonElement >( null );
	const { data: subscribersTotals } = useSubscriberCountQuery( siteId );
	const hasSubscribers = !! subscribersTotals?.total_subscribers;
	const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
	const { downloadCSV } = useDownloadSubscribersCSV( siteId );

	const hasMultipleSites = currentUserSiteCount && currentUserSiteCount > 1;

	// No point showing the dropdown if they don't have subscribers or sites
	if ( ! hasSubscribers && ! hasMultipleSites ) {
		return null;
	}

	return (
		<div>
			<Button
				className={ clsx( 'subscriber-popover__toggle', {
					'is-popover-visible': isVisible,
				} ) }
				onClick={ onToggle }
				ref={ buttonRef }
				icon={ <Icon icon={ moreVertical } size={ 18 } /> }
				size="compact"
			/>

			<PopoverMenu
				position="bottom left"
				onClose={ () => setIsVisible( false ) }
				isVisible={ isVisible }
				context={ buttonRef.current }
				className="subscriber-popover"
				focusOnShow={ false }
			>
				{ hasSubscribers ? (
					<PopoverMenuItem
						onClick={ ( event: React.MouseEvent ) => {
							event.preventDefault();
							downloadCSV();
						} }
					>
						{ translate( 'Download subscribers as CSV' ) }
					</PopoverMenuItem>
				) : null }
				{ hasMultipleSites ? (
					<PopoverMenuItem onClick={ openMigrateSubscribersModal }>
						{ translate( 'Migrate subscribers from another WordPress.com site' ) }
					</PopoverMenuItem>
				) : null }
			</PopoverMenu>
		</div>
	);
};

export default SubscribersHeaderPopover;
