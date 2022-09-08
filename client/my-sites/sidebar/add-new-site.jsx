import { Button } from '@automattic/components';
import { useDispatch } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import { onboardingUrl } from 'calypso/lib/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

export const AddNewSite = ( { title } ) => {
	const reduxDispatch = useDispatch();

	const onClick = () => {
		reduxDispatch( recordTracksEvent( 'calypso_add_new_wordpress_click' ) );
		reduxDispatch( setLayoutFocus( 'content' ) );
	};

	return (
		<li className="sidebar__actions">
			<Button transparent href={ `${ onboardingUrl() }?ref=calypso-sidebar` } onClick={ onClick }>
				<span class="sidebar__action--collapsed dashicons dashicons-plus-alt"></span>
				<span>{ title }</span>
			</Button>
		</li>
	);
};

AddNewSite.propTypes = {
	title: TranslatableString.isRequired,
};

export default AddNewSite;
