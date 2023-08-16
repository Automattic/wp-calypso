import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { addQueryArgs } from 'calypso/lib/url';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { useRecordExport } from '../../tracks';
import '../shared/popover-style.scss';

type SubscribersHeaderPopoverProps = {
	siteId: number | undefined;
};

const SubscribersHeaderPopover = ( { siteId }: SubscribersHeaderPopoverProps ) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const dispatch = useDispatch();
	const onToggle = useCallback( () => setIsVisible( ( visible ) => ! visible ), [] );
	const buttonRef = useRef< HTMLButtonElement >( null );
	const downloadCsvLink = addQueryArgs(
		{ page: 'subscribers', blog: siteId, blog_subscribers: 'csv', type: 'all' },
		'https://dashboard.wordpress.com/wp-admin/index.php'
	);
	const recordExport = useRecordExport();

	const onDownloadCsvClick = () => {
		dispatch(
			recordGoogleEvent(
				'Subscribers',
				'Clicked Download email subscribers as CSV menu item on Subscribers'
			)
		);
		recordExport();
	};

	return (
		<div className="subscriber-popover__container">
			<button
				className={ classNames( 'subscriber-popover__toggle', {
					'is-popover-visible': isVisible,
				} ) }
				onClick={ onToggle }
				ref={ buttonRef }
			>
				<Gridicon icon="ellipsis" size={ 24 } />
			</button>

			<PopoverMenu
				position="bottom left"
				onClose={ () => setIsVisible( false ) }
				isVisible={ isVisible }
				context={ buttonRef.current }
				className="subscriber-popover"
				focusOnShow={ false }
			>
				<PopoverMenuItem href={ downloadCsvLink } onClick={ onDownloadCsvClick }>
					{ translate( 'Download subscribers as CSV' ) }
				</PopoverMenuItem>
			</PopoverMenu>
		</div>
	);
};

export default SubscribersHeaderPopover;
