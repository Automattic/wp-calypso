import { NextButton } from '@automattic/onboarding';
import { check, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

const AuthorizationBenefits = ( { benefits }: { benefits: string[] } ) => {
	return (
		<div className="site-migration-application-password-authorization__benefits">
			{ benefits.map( ( benefit, index ) => (
				<div
					className="site-migration-application-password-authorization__benefits-item"
					key={ index }
				>
					<div className="site-migration-application-password-authorization__benefits-item-icon">
						<Icon icon={ check } size={ 20 } />
					</div>
					<span>{ benefit }</span>
				</div>
			) ) }
		</div>
	);
};

interface AuthorizationProps {
	onShareCredentialsClick: () => void;
	onAuthorizationClick: () => void;
}

const Authorization = ( { onShareCredentialsClick, onAuthorizationClick }: AuthorizationProps ) => {
	const translate = useTranslate();
	return (
		<div className="site-migration-application-password-authorization__authorization">
			<div>
				<NextButton onClick={ onAuthorizationClick }>
					{ translate( 'Authorize access' ) }
				</NextButton>
			</div>
			<div>
				<button
					className="button navigation-link step-container__navigation-link has-underline is-borderless"
					type="button"
					onClick={ onShareCredentialsClick }
				>
					{ translate( 'Share credentials instead' ) }
				</button>
			</div>
			<div className="site-migration-application-password-authorization__benefits-container">
				<h3>{ translate( "Here's what else you're getting" ) }</h3>
				<AuthorizationBenefits
					benefits={ [
						translate( 'Uninterrupted service throughout the entire migration experience.' ),
						translate( 'Unmatched reliability with 99.999% uptime and unmetered traffic.' ),
						translate( 'Round-the-clock security monitoring and DDoS protection.' ),
					] }
				/>
			</div>
		</div>
	);
};

export default Authorization;
