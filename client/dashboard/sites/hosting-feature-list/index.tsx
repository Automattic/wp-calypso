import { DotcomFeatures, HostingFeatures, Site } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';
import { hasPlanFeature } from '../../utils/site-features';

export default function HostingFeatureList( { site }: { site: Site } ) {
	const features = [
		hasPlanFeature( site, HostingFeatures.DEPLOYMENT ) && (
			<Text as="li" variant="muted">
				{ __( 'Git-based deployments' ) }
			</Text>
		),
		hasPlanFeature( site, HostingFeatures.MONITOR ) && (
			<Text as="li" variant="muted">
				{ __( 'Server monitoring' ) }
			</Text>
		),
		hasPlanFeature( site, HostingFeatures.LOGS ) && (
			<Text as="li" variant="muted">
				{ __( 'Access and error logs' ) }
			</Text>
		),
		hasPlanFeature( site, HostingFeatures.SSH ) && (
			<Text as="li" variant="muted">
				{ __( 'Secure access via SFTP/SSH' ) }
			</Text>
		),
		hasPlanFeature( site, HostingFeatures.SFTP ) && (
			<Text as="li" variant="muted">
				{ __( 'Advanced server settings' ) }
			</Text>
		),
		hasPlanFeature( site, HostingFeatures.BACKUPS ) && (
			<Text as="li" variant="muted">
				{ __( 'Backup and restore' ) }
			</Text>
		),
		hasPlanFeature( site, HostingFeatures.SCAN ) && (
			<Text as="li" variant="muted">
				{ __( 'Security scans' ) }
			</Text>
		),
		hasPlanFeature( site, DotcomFeatures.ATOMIC ) && (
			<Text as="li" variant="muted">
				{ __( 'Install plugins and themes' ) }
			</Text>
		),
	]
		.filter( Boolean )
		.slice( 0, 5 );

	return <ul style={ { paddingInlineStart: '15px', margin: 0 } }>{ features }</ul>;
}
