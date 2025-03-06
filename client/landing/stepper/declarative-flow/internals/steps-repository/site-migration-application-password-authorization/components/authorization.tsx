import { NextButton } from '@automattic/onboarding';
import { Icon, loop, backup, shield } from '@wordpress/icons';
import { numberFormat, useTranslate, type TranslateResult } from 'i18n-calypso';

interface AuthorizationBenefitsItem {
	icon: React.ReactElement;
	text: TranslateResult;
}

interface AuthorizationBenefitsProps {
	benefits: AuthorizationBenefitsItem[];
}

const AuthorizationBenefits = ( { benefits }: AuthorizationBenefitsProps ) => {
	return (
		<div className="site-migration-application-password-authorization__benefits">
			{ benefits.map( ( benefit, index ) => (
				<div
					className="site-migration-application-password-authorization__benefits-item"
					key={ index }
				>
					<div className="site-migration-application-password-authorization__benefits-item-icon">
						<Icon icon={ benefit.icon } size={ 20 } />
					</div>
					<span>{ benefit.text }</span>
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
						{
							icon: loop,
							text: translate(
								'Uninterrupted service throughout the entire migration experience.'
							),
						},
						{
							icon: backup,
							text: translate(
								'Unmatched reliability with %(uptimePercent)s uptime and unmetered traffic.',
								{
									args: {
										uptimePercent: numberFormat( 0.99999, {
											numberFormatOptions: { style: 'percent', maximumFractionDigits: 3 },
										} ),
									},
									comment: '99.999% uptime',
								}
							),
						},
						{
							icon: shield,
							text: translate( 'Round-the-clock security monitoring and DDoS protection.' ),
						},
					] }
				/>
			</div>
		</div>
	);
};

export default Authorization;
