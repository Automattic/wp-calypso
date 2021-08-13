import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, wordpress } from '@wordpress/icons';

export default function CustomNavigationToggleButton() {
	const siteIconUrl = useSelect( ( select ) => {
		const { getEntityRecord } = select( 'core' );
		return getEntityRecord( 'root', '__unstableBase', undefined )?.site_icon_url;
	} );

	const buttonIcon = siteIconUrl ? (
		<img
			alt={ __( 'Site Icon', 'full-site-editing' ) }
			className="edit-site-navigation-toggle__site-icon"
			src={ siteIconUrl }
		/>
	) : (
		<Icon size="36px" icon={ wordpress } />
	);

	const onClick = () => {
		const calypsoCloseUrl = window?.calypsoifyGutenberg?.closeUrl;
		if ( calypsoCloseUrl ) {
			window.top.location.href = calypsoCloseUrl;
		} else {
			window.location.href = './index.php';
		}
	};

	return (
		<Button
			className="edit-site-navigation-toggle__button has-icon"
			label={ __( 'Back to Dashboard', 'full-site-editing' ) }
			onClick={ onClick }
			showTooltip
		>
			{ buttonIcon }
		</Button>
	);
}
