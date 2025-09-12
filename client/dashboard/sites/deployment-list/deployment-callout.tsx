import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Callout } from '../../components/callout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import illustrationUrl from '../deployment-list/deployments-callout-illustration.svg';
import ghIconUrl from '../deployment-list/gh-icon.svg';

export function DeploymentCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<Callout
			icon={ <img src={ ghIconUrl } alt={ __( 'GitHub logo' ) } /> }
			title={ __( 'Deploy from GitHub' ) }
			titleAs={ titleAs }
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __(
							'Connect your GitHub repo directly to your WordPress.com site—with seamless integration, straightforward version control, and automated workflows.'
						) }
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Available on the WordPress.com Business and Commerce plans.' ) }
					</Text>
				</>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					tracksId="deployments"
					variant="primary"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}
