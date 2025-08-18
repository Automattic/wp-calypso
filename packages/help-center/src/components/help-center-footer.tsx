import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, CardFooter } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useStillNeedHelpURL } from '../hooks';

import './help-center-footer.scss';

export const HelpCenterContactButton = () => {
	const { __ } = useI18n();
	const { url } = useStillNeedHelpURL();
	const { sectionName } = useHelpCenterContext();
	const redirectToWpcom = url === 'https://wordpress.com/help/contact';
	const navigate = useNavigate();
	const [ isCreatingChat, setIsCreatingChat ] = useState( false );

	const handleClick = async () => {
		setIsCreatingChat( true );
		recordTracksEvent( 'calypso_inlinehelp_morehelp_click', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			button_type: 'Still need help?',
		} );

		setIsCreatingChat( false );
		const to = redirectToWpcom ? { pathname: url } : url;
		navigate( to );
	};

	return (
		<Button
			onClick={ handleClick }
			disabled={ isCreatingChat }
			variant="secondary"
			className="button help-center-contact-page__button"
			__next40pxDefaultSize
		>
			{ __( 'Need help? Get in touch', __i18n_text_domain__ ) }
		</Button>
	);
};

const HelpCenterFooter: React.FC = () => {
	return (
		<>
			<CardFooter className="help-center__container-footer">
				<div className="help-center-footer-blender"></div>
				<Routes>
					<Route path="/" element={ <HelpCenterContactButton /> } />
					<Route path="/post" element={ <HelpCenterContactButton /> } />
					<Route path="/chat-history" element={ <HelpCenterContactButton /> } />
					<Route path="*" element={ null } />
				</Routes>
			</CardFooter>
		</>
	);
};

export default HelpCenterFooter;
