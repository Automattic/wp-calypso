import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import { Button, CardFooter } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useStillNeedHelpURL } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';

import './help-center-footer.scss';

export const HelpCenterContactButton = () => {
	const { __ } = useI18n();
	const { url } = useStillNeedHelpURL();
	const { sectionName } = useHelpCenterContext();
	const navigate = useNavigate();
	const { setMessage } = useDispatch( HELP_CENTER_STORE );
	const searchQuery = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getMessage(),
		[]
	);

	const handleClick = () => {
		recordTracksEvent( 'calypso_inlinehelp_morehelp_click', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			button_type: 'Still need help?',
		} );

		navigate(
			url === '/odie' && searchQuery ? `/odie?query=${ encodeURIComponent( searchQuery ) }` : url
		);

		setMessage( '' );
	};

	return (
		<CardFooter className="help-center__container-footer">
			<Button
				onClick={ handleClick }
				variant="secondary"
				className="button help-center-contact-page__button"
				__next40pxDefaultSize
			>
				{ __( 'Need help? Get in touch', __i18n_text_domain__ ) }
			</Button>
		</CardFooter>
	);
};

const HelpCenterFooter: React.FC = () => {
	return (
		<>
			<Routes>
				<Route path="/" element={ <HelpCenterContactButton /> } />
				<Route path="/post" element={ <HelpCenterContactButton /> } />
				<Route path="/chat-history" element={ <HelpCenterContactButton /> } />
				<Route path="/support-guides" element={ <HelpCenterContactButton /> } />
				<Route path="*" element={ null } />
			</Routes>
		</>
	);
};

export default HelpCenterFooter;
