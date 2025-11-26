import { DotcomFeatures, HostingFeatures, Site } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';
import { hasPlanFeature } from '../../utils/site-features';

export default function HostingFeatureList( { site }: { site: Site } ) {
	const features = [
		{
			feature: HostingFeatures.DEPLOYMENT,
			text: __( 'Git-based deployments' ),
		},
		{
			feature: HostingFeatures.MONITOR,
			text: __( 'Server monitoring' ),
		},
		{
			feature: HostingFeatures.LOGS,
			text: __( 'Access and error logs' ),
		},
		{
			feature: HostingFeatures.SSH,
			text: __( 'Secure access via SFTP/SSH' ),
		},
		{
			feature: HostingFeatures.SFTP,
			text: __( 'Advanced server settings' ),
		},
		{
			feature: HostingFeatures.BACKUPS,
			text: __( 'Backup and restore' ),
		},
		{
			feature: HostingFeatures.SCAN,
			text: __( 'Security scans' ),
		},
		{
			feature: DotcomFeatures.ATOMIC,
			text: __( 'Install plugins and themes' ),
		},
	]
		.filter( ( { feature } ) => hasPlanFeature( site, feature ) )
		.slice( 0, 5 )
		.map( ( { text } ) => (
			<Text as="li" key={ text } variant="muted">
				{ text }
			</Text>
		) );

	return <ul style={ { paddingInlineStart: '15px', margin: 0 } }>{ features }</ul>;
}
