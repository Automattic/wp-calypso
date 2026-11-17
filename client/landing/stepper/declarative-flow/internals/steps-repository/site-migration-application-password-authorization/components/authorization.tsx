import { formatNumber } from '@automattic/number-formatters';
import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
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
		<>
			<Button
				className="site-migration-application-password-authorization__authorize"
				variant="primary"
				onClick={ onAuthorizationClick }
				__next40pxDefaultSize
			>
				{ translate( 'Authorize access' ) }
			</Button>
			<div className="account-template__secondary-actions">
				<Step.LinkButton onClick={ onShareCredentialsClick }>
					{ translate( 'Share credentials instead' ) }
				</Step.LinkButton>
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
		</>
	);
};

export default Authorization;
