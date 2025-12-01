import { __experimentalText as Text, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import HostingFeatureList from '../hosting-feature-list';
import illustrationUrl from './upsell-illustration.svg';
import type { Site } from '@automattic/api-core';
import type { ReactNode } from 'react';

export default function ActivationCallout( {
	site,
	main,
	onClick,
}: {
	site: Site;
	main?: ReactNode;
	onClick: () => void;
} ) {
	const callout = (
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

					<HostingFeatureList site={ site } />
				</>
			}
			actions={
				<Button variant="primary" size="compact" onClick={ onClick }>
					{ __( 'Activate' ) }
				</Button>
			}
		/>
	);

	if ( main ) {
		return <CalloutOverlay callout={ callout } main={ main } />;
	}

	return callout;
}
