import { Button } from '@automattic/components';
import { useSelector, useDispatch } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

export const AddNewSite = ( { title } ) => {
	const reduxDispatch = useDispatch();

	const addNewSiteUrl = useAddNewSiteUrl( {
		ref: 'calypso-sidebar',
		source: 'calypso-static',
	} );

	const visibleSiteCount = useSelector( getCurrentUser ).visible_site_count;
	if ( visibleSiteCount > 1 ) {
		return null;
	}

	const onClick = () => {
		reduxDispatch( recordTracksEvent( 'calypso_add_new_wordpress_click' ) );
		reduxDispatch( setLayoutFocus( 'content' ) );
	};

	return (
		<li className="sidebar__actions">
			<Button transparent href={ addNewSiteUrl } onClick={ onClick }>
				<span className="sidebar__action--collapsed dashicons dashicons-plus-alt"></span>
				<span>{ title }</span>
			</Button>
		</li>
	);
};

AddNewSite.propTypes = {
	title: TranslatableString.isRequired,
};

export default AddNewSite;
