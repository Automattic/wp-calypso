import { HelpIcon } from '@automattic/help-center';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { registerPlugin } from '@wordpress/plugins';

function HelpCenterContent() {
	const isDesktop = useMediaQuery( '(min-width: 480px)' );

	const content = (
		<>
			<Button
				className="help-center"
				href={ localizeUrl( 'https://wordpress.com/help' ) }
				icon={ <HelpIcon /> }
				label="Help"
				size="compact"
				target="_blank"
			/>
		</>
	);

	return isDesktop && <Fill name="PinnedItems/core">{ content }</Fill>;
}

registerPlugin( 'etk-help-center', {
	render: () => {
		return <HelpCenterContent />;
	},
} );
