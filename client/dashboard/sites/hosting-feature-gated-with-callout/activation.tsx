import { __experimentalText as Text, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Callout } from '../../components/callout';
import illustrationUrl from './upsell-illustration.svg';

export default function ActivationCallout( { onClick }: { onClick: () => void } ) {
	return (
		<Callout
			image={ illustrationUrl }
			title={ __( 'Activate hosting features' ) }
			description={
				<>
					<Text variant="muted">
						{ __(
							'Your plan includes a range of powerful hosting features. Activate them to get started.'
						) }
					</Text>

					<ul style={ { paddingInlineStart: '15px', margin: 0 } }>
						<Text as="li" variant="muted">
							{ __( 'Git-based deployments' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Server monitoring' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Access and error logs' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Secure access via SFTP/SSH' ) }
						</Text>
						<Text as="li" variant="muted">
							{ __( 'Advanced server settings' ) }
						</Text>
					</ul>
				</>
			}
			actions={
				<Button variant="primary" size="compact" onClick={ onClick }>
					{ __( 'Activate' ) }
				</Button>
			}
		/>
	);
}
