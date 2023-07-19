import { IntentScreen } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { Icon, unlock, plus, payment } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { preventWidows } from 'calypso/lib/formatting';

interface Props {
	onSubmit: () => void;
}

const Intro: React.FC< Props > = ( { onSubmit } ) => {
	const { __ } = useI18n();

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
										"Head to your current registrar's domain management settings, where you'll find the authorization code to unlock your domain."
									) }
								</p>
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
							<>
								<p>
									{ __(
										'In the next step, add your domains and authorization codes and begin the transfer.'
									) }
								</p>
							</>
						),
						icon: <Icon icon={ plus } />,
						value: 'setup',
						actionText: null,
					},
					{
						key: 'finalize',
						title: __( 'Checkout' ),
						description: (
							<p>{ __( "Review your payment details and you're ready to start the transfer." ) }</p>
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
			<div style={ { display: 'flex', justifyContent: 'center' } }>
				<Button variant="primary" onClick={ onSubmit }>
					{ __( 'Get started' ) }
				</Button>
			</div>
		</>
	);
};

export default Intro;
