import { IntentScreen, GOOGLE_TRANSFER } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { Icon, unlock, plus, payment } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import GoogleDomainsModal from 'calypso/landing/stepper/declarative-flow/internals/components/google-domains-transfer-instructions';
import { preventWidows } from 'calypso/lib/formatting';

interface Props {
	onSubmit: () => void;
	variantSlug: string | undefined;
}

const Intro: React.FC< Props > = ( { onSubmit, variantSlug } ) => {
	const { __ } = useI18n();
	const isGoogleDomainsTransferFlow = GOOGLE_TRANSFER === variantSlug;

	return (
		<>
			<IntentScreen
				intents={ [
					{
						key: 'unlock',
						title: __( 'Unlock your domains' ),
						description: (
							<>
								<p>
									{ __(
										"Your current registrar's domain management interface should have an option for you to remove the lock."
									) }
								</p>
								{ isGoogleDomainsTransferFlow && (
									<GoogleDomainsModal className="unlock-instructions__cta">
										{ __( 'Show me how' ) }
									</GoogleDomainsModal>
								) }
							</>
						),
						icon: <Icon icon={ unlock } />,
						value: 'firstPost',
						actionText: null,
					},
					{
						key: 'setup',
						title: __( 'Add domains' ),
						description: (
							<p>
								{ __(
									'Add all domain names (along with their authorization codes) to start the transfer.'
								) }
							</p>
						),
						icon: <Icon icon={ plus } />,
						value: 'setup',
						actionText: null,
					},
					{
						key: 'finalize',
						title: __( 'Checkout' ),
						badge: isGoogleDomainsTransferFlow
							? __( 'We pay the first year' )
							: __( 'We pay the first year for Google domains' ),
						description: (
							<p>
								{ __(
									"Review your payment and contact details. If you're transferring a domain from Squarespace, we'll pay for an additional year of registration if your domain was registered before July 1, 2023."
								) }
							</p>
						),
						icon: <Icon icon={ payment } />,
						value: 'finalize',
						actionText: null,
					},
				] }
				intentsAlt={ [] }
				preventWidows={ preventWidows }
				onSelect={ onSubmit }
			/>
			<div className="bulk-domain-transfer__cta-container">
				<Button variant="primary" className="bulk-domain-transfer__cta" onClick={ onSubmit }>
					{ __( 'Get Started' ) }
				</Button>
			</div>
		</>
	);
};

export default Intro;
