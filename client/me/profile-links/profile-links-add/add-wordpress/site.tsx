import { FormLabel } from '@automattic/components';
import { VisuallyHidden } from '@wordpress/components';
import { useDispatch } from 'react-redux';
import Site from 'calypso/blocks/site';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

type ProfileLinksAddWordPressSiteProps = {
	checked?: boolean;
	site: { ID: number; title: string };
	onSelect: ( ID: number ) => void;
};

const ProfileLinksAddWordPressSite = ( {
	checked = false,
	onSelect,
	site,
}: ProfileLinksAddWordPressSiteProps ) => {
	const dispatch = useDispatch();
	const inputName = `site-${ site.ID }`;

	const handleClick = () => {
		const action = `Clicked 'Add WordPress Site' checkbox`;
		dispatch( recordGoogleEvent( 'Me', action, 'checked', checked ) );
	};

	return (
		<li className="profile-links-add-wordpress__item">
			<FormLabel onClick={ handleClick }>
				<FormInputCheckbox
					className="profile-links-add-wordpress__checkbox"
					name={ inputName }
					onChange={ () => onSelect( site.ID ) }
					checked={ checked }
				/>
				<VisuallyHidden>{ site.title }</VisuallyHidden>
			</FormLabel>

			<Site siteId={ site.ID } indicator={ false } onSelect={ () => onSelect( site.ID ) } />
		</li>
	);
};

export default ProfileLinksAddWordPressSite;
