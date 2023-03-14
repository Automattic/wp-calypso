import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, wordpress } from '@wordpress/icons';

type CorePlaceholder = {
	getEntityRecord: ( ...args: unknown[] ) => { site_icon_url?: string } | null;
};

export default function SiteIcon() {
	// The site icon url should be available from /wp/v2/settings or similar in the future,
	// but for now it's accessible at the index endpoint.
	// https://github.com/WordPress/gutenberg/blob/68c3978be352c6d3982f73bcf8c80744608c53c8/lib/init.php#L160
	const siteIconUrl: string | undefined = useSelect( ( select ) => {
		const { getEntityRecord }: CorePlaceholder = select( 'core' );
		// getEntityRecord usually takes a key to get a specific entity, but here we pass undefined to get the "root" entity.
		// While this works, the function isn't typed this way, so casting undefined as number to prevent compiler errors.
		const siteData =
			getEntityRecord( 'root', '__unstableBase', undefined as unknown as number ) || {};
		return siteData.site_icon_url;
	}, [] );

	if ( siteIconUrl ) {
		return (
			<img
				className="edit-post-fullscreen-mode-close_site-icon"
				alt={ __( 'Site Icon', 'full-site-editing' ) }
				src={ siteIconUrl }
			/>
		);
	}

	return <Icon size={ 36 } icon={ wordpress } />;
}
