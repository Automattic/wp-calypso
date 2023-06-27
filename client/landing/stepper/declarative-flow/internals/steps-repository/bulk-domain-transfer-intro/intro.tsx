import { IntentScreen } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { Icon, lock, cog, payment } from '@wordpress/icons';
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
						title: __( 'Unlock your domains at your current registrar' ),
						description: <p>{ __( 'This allows us to transfer them' ) }</p>,
						icon: <Icon icon={ lock } />,
						value: 'firstPost',
						actionText: null,
					},
					{
						key: 'setup',
						title: __( 'Setup your domains at WordPress.com' ),
						description: <p>{ __( 'To keep your sites up and running!' ) }</p>,
						icon: <Icon icon={ cog } />,
						value: 'setup',
						actionText: null,
					},
					{
						key: 'finalize',
						title: __( 'Finalize the transfer' ),
						description: <p>{ __( 'Finalize the details and submit your transfer' ) }</p>,
						icon: <Icon icon={ payment } />,
						value: 'finalize',
						actionText: null,
					},
				] }
				intentsAlt={ [] }
				preventWidows={ preventWidows }
				onSelect={ onSubmit }
			/>
			<div>
				<Button
					isPrimary
					style={ { width: '100%', justifyContent: 'center' } }
					onClick={ onSubmit }
				>
					{ __( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default Intro;
