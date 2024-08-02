/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { Icon, comment } from '@wordpress/icons';
import { useNavigate } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useContactFormTitle } from '../hooks';
import { HelpCenterContactPage } from './help-center-contact-page';

export const ExtraContactOptions = ( { isUserElegible }: { isUserElegible: boolean } ) => {
	const navigate = useNavigate();
	const data = useContactFormTitle( 'FORUM' );
	const handleOnClick = () => {
		recordTracksEvent( 'calypso_odie_extra_contact_option', {
			contact_option: 'forum',
			is_user_elegible: false,
		} );
		navigate( '/contact-form?mode=FORUM' );
	};
	if ( isUserElegible ) {
		return (
			<div className="help-center-contact-support">
				<button onClick={ handleOnClick }>
					<div className="help-center-contact-support__box support" role="button" tabIndex={ 0 }>
						<div className="help-center-contact-support__box-icon">
							<Icon icon={ comment } />
						</div>
						<div>
							<h2>{ data.formTitle }</h2>
							<p>{ data.formDisclaimer }</p>
						</div>
					</div>
				</button>
			</div>
		);
	}

	return (
		<div className="help-center__container-extra-contact-options">
			<HelpCenterContactPage
				hideHeaders
				trackEventName="calypso_odie_extra_contact_option"
				isUserElegible
			/>
		</div>
	);
};
