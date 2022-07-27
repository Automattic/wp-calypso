import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useHasSeenWhatsNewModalQuery } from '@automattic/data-stores';
import { HelpIcon } from '@automattic/help-center';
import classnames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { setHelpCenterVisible } from 'calypso/state/ui/actions';
import { getSectionName } from 'calypso/state/ui/selectors';
import isHelpCenterVisible from 'calypso/state/ui/selectors/help-center-is-visible';
import Item from './item';

const MasterbarHelpCenter = ( { siteId } ) => {
	const { isLoading, data } = useHasSeenWhatsNewModalQuery( siteId );
	const sectionName = useSelector( getSectionName );

	const newItems = ! isLoading && ! data?.has_seen_whats_new_modal;

	const helpCenterVisible = useSelector( isHelpCenterVisible );
	const dispatch = useDispatch();

	const handleToggleHelpCenter = () => {
		recordTracksEvent( `calypso_inlinehelp_${ helpCenterVisible ? 'close' : 'show' }`, {
			location: 'help-center',
			section: sectionName,
		} );

		dispatch( setHelpCenterVisible( ! helpCenterVisible ) );
	};

	return (
		<Item
			onClick={ handleToggleHelpCenter }
			className={ classnames( 'masterbar__item-help', {
				'is-active': helpCenterVisible,
			} ) }
			icon={ <HelpIcon tooltip="Help" newItems={ newItems } /> }
		/>
	);
};

export default MasterbarHelpCenter;
