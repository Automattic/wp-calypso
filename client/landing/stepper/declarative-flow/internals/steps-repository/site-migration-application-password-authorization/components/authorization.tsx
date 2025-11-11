import { formatNumber } from '@automattic/number-formatters';
import { NextButton } from '@automattic/onboarding';
import { loop, backup, shield } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChecklistCard } from 'calypso/landing/stepper/declarative-flow/internals/components/checklist-card';

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
			<ChecklistCard
				title={ translate( "Here's what else you're getting" ) }
				items={ [
					{
						icon: loop,
						text: translate( 'Uninterrupted service throughout the entire migration experience.' ),
					},
					{
						icon: backup,
						text: translate(
							'Unmatched reliability with %(uptimePercent)s uptime and unmetered traffic.',
							{
								args: {
									uptimePercent: formatNumber( 0.99999, {
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
	);
};

export default Authorization;
