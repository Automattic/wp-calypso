import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { IntentScreen } from '@automattic/onboarding';
import { Button, Modal } from '@wordpress/components';
import { useState, createElement, createInterpolateElement } from '@wordpress/element';
import { Icon, unlock, plus, payment } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { preventWidows } from 'calypso/lib/formatting';

interface Props {
	onSubmit: () => void;
}

const Intro: React.FC< Props > = ( { onSubmit } ) => {
	const { __, hasTranslation } = useI18n();
	const isEnglishLocale = useIsEnglishLocale();
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

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
								<Button variant="link" onClick={ openModal }>
									Learn More
								</Button>
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
						badge: __( 'Free for Google Domains' ),
						description: (
							<p>
								{ isEnglishLocale ||
								hasTranslation(
									"Review your payment and contact details. If you're transferring a domain from Google, we'll pay for an additional year of registration."
								)
									? __(
											"Review your payment and contact details. If you're transferring a domain from Google, we'll pay for an additional year of registration."
									  )
									: __(
											'Review your payment and contact details. Google Domains transfers and the first year are free.'
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
			{ isOpen && (
				<Modal
					className="bulk-domain-transfer__google-instructions"
					title="How to unlock your Google domains"
					onRequestClose={ closeModal }
					style={ { width: '500px' } }
				>
					<p>
						{ __( 'Follow these steps to transfer your domain from Google to WordPress.com:' ) }
					</p>
					<details>
						<summary>
							{ createInterpolateElement(
								__( '<strong>Step 1.</strong> Visit your <a>Google Domains dashboard</a>' ),
								{
									strong: createElement( 'strong' ),
									a: createElement( 'a', {
										href: 'https://domains.google.com/registrar/',
										target: '_blank',
										rel: 'noreferrer',
									} ),
								}
							) }
						</summary>
						<p>
							{ __(
								'Log in to your Google Domains dashboard to see a list of all of your registered domains.'
							) }
						</p>
					</details>
					<details>
						<summary>
							<strong>Step 2.</strong> Select your domain
						</summary>
						<p>{ __( 'Select the domain you want to transfer in the "My domains" section.' ) }</p>
					</details>
					<details>
						<summary>
							<strong>Step 3.</strong> Go to "Registration settings"
						</summary>
						<p>
							{ __(
								'In the "Registration settings" section, scroll down to the "Transfer out" panel.'
							) }
						</p>
					</details>
					<details>
						<summary>
							<strong>Step 4.</strong> Get auth code
						</summary>
						<p>
							{ __(
								'Click "Get auth code" and then "Unlock and continue". Copy the code that is shown to your clipboard.'
							) }
						</p>
					</details>
				</Modal>
			) }
			<div className="bulk-domain-transfer__cta-container">
				<Button variant="primary" className="bulk-domain-transfer__cta" onClick={ onSubmit }>
					{ __( 'Get Started' ) }
				</Button>
			</div>
		</>
	);
};

export default Intro;
