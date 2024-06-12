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
				onClick={ () => window.open( localizeUrl( 'https://wordpress.com/support/' ), '_blank' ) }
				icon={ <HelpIcon /> }
				label="Help"
				size="compact"
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
