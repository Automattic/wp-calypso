import './config';
import { HelpIcon } from '@automattic/help-center';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { registerPlugin } from '@wordpress/plugins';
import './help-center.scss';

function HelpCenterContent() {
	const isDesktop = useMediaQuery( '(min-width: 480px)' );

	const content = (
		<>
			<Button
				className="help-center"
				href="https://wordpress.com/help"
				icon={ <HelpIcon /> }
				label="Help"
				size="compact"
				target="_blank"
			/>
		</>
	);

	return isDesktop && <Fill name="PinnedItems/core">{ content }</Fill>;
}

registerPlugin( 'jetpack-help-center', {
	render: () => {
		return <HelpCenterContent />;
	},
} );
