import { HelpIcon } from '@automattic/help-center';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHasSeenWhatsNewModalQuery } from 'calypso/data/block-editor/use-has-seen-whats-new-modal-query';
import { setHelpCenterVisible } from 'calypso/state/ui/actions';
import isHelpCenterVisible from 'calypso/state/ui/selectors/help-center-is-visible';
import Item from './item';

const MasterbarHelpCenter = ( { siteId } ) => {
	const [ newItems, setNewItems ] = useState( false );
	const { isLoading, data } = useHasSeenWhatsNewModalQuery( siteId );

	useEffect( () => {
		if ( ! isLoading && data ) {
			setNewItems( ! data.has_seen_whats_new_modal );
		}
	}, [ data, isLoading ] );

	const helpCenterVisible = useSelector( isHelpCenterVisible );
	const dispatch = useDispatch();
	return (
		<Item
			onClick={ () => dispatch( setHelpCenterVisible( ! helpCenterVisible ) ) }
			className={ classnames( 'masterbar__item-help', {
				'is-active': helpCenterVisible,
			} ) }
			icon={ <HelpIcon newItems={ newItems } active={ helpCenterVisible } /> }
		/>
	);
};

export default MasterbarHelpCenter;
