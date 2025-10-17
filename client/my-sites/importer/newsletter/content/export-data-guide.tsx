import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import { fixMe } from 'i18n-calypso';
import exportSubstackDataImg from 'calypso/assets/images/importer/export-substack-content.png';
import { normalizeFromSite } from '../utils';

export default function ExportDataGuide( {
	fromSite,
	selectedSiteUrl,
}: {
	fromSite: string;
	selectedSiteUrl: string;
} ) {
	const baseUrl = normalizeFromSite( fromSite );

	const settingsUrl = `${
		baseUrl.endsWith( '/' ) ? baseUrl.slice( 0, -1 ) : baseUrl
	}/publish/settings?search=export`;

	return (
		<>
			<h2>{ __( 'Step 1: Export your content from Substack' ) }</h2>
			<p>
				{ createInterpolateElement(
					( fixMe( {
						text: 'Generate a ZIP file of all your Substack posts. On Substack, go to Settings > Import/Export, click <strong>New export</strong>, and upload the downloaded ZIP file in the next step.',
						newCopy: __(
							'Generate a ZIP file of all your Substack posts. On Substack, go to Settings > Import/Export, click <strong>New export</strong>, and upload the downloaded ZIP file in the next step.'
						),
						oldCopy: __(
							'Generate a ZIP file of all your Substack posts. On Substack, go to Settings > Exports, click <strong>New export</strong>, and upload the downloaded ZIP file in the next step.'
						),
					} ) || '' ) as string,
					{
						strong: <strong />,
					}
				) }
			</p>
			<img
				src={ exportSubstackDataImg }
				alt={ __( 'Export Substack data' ) }
				className="export-content"
			/>
			<Button
				href={ settingsUrl }
				target="_blank"
				rel="noreferrer noopener"
				icon={ external }
				iconPosition="right"
				variant="primary"
			>
				{ __( 'Open Substack settings' ) }
			</Button>
			<hr />
			<h2>{ __( 'Step 2: Import your content to WordPress.com' ) }</h2>
			<p>
				{ createInterpolateElement(
					( fixMe( {
						text: 'Your posts may be added to your homepage by default. If you prefer your posts to load on a separate page, first go to <a>Reading settings</a>, and change "Your homepage displays" to a static page.',
						newCopy: __(
							'Your posts may be added to your homepage by default. If you prefer your posts to load on a separate page, first go to <a>Reading settings</a>, and change "Your homepage displays" to a static page.'
						),
						oldCopy: __(
							'Your posts may be added to your homepage by default. If you prefer your posts to load on a separate page, first go to <a>Reading Settings</a>, and change "Your homepage displays" to a static page.'
						),
					} ) || '' ) as string,
					{
						a: (
							<a
								href={ `${ selectedSiteUrl }/wp-admin/options-reading.php` }
								target="_blank"
								rel="noreferrer noopener"
							/>
						),
					}
				) }
			</p>
		</>
	);
}
