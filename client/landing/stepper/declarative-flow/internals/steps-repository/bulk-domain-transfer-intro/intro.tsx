import { localizeUrl } from '@automattic/i18n-utils';
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
						title: __( 'Unlock at current registrar' ),
						description: (
							<>
								<p>
									{ __(
										'Your domain management interface should have an option for you to remove this lock.'
									) }
								</p>
								<a
									href={ localizeUrl(
										'https://wordpress.com/support/domains/incoming-domain-transfer/'
									) }
									target="_blank"
									rel="noopener noreferrer"
									className="select-items__item-learn-more"
								>
									{ __( 'Learn more' ) }
								</a>
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
								<p>{ __( 'Add all domain names with authorization codes to start transfer.' ) }</p>
								<a
									href={ localizeUrl(
										'https://wordpress.com/support/domains/incoming-domain-transfer/'
									) }
									target="_blank"
									rel="noopener noreferrer"
									className="select-items__item-learn-more"
								>
									{ __( 'Learn more' ) }
								</a>
							</>
						),
						icon: <Icon icon={ plus } />,
						value: 'setup',
						actionText: null,
					},
					{
						key: 'finalize',
						title: __( 'Checkout' ),
						description: <p>{ __( 'Add your payment details to finalize.' ) }</p>,
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
				<Button isPrimary onClick={ onSubmit }>
					{ __( "I'm ready!" ) }
				</Button>
			</div>
		</>
	);
};

export default Intro;
