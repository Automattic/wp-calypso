import './config';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { registerPlugin } from '@wordpress/plugins';
import HelpIcon from '../src/components/help-icon';
import './help-center.scss';

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

registerPlugin( 'jetpack-help-center', {
	render: () => {
		return <HelpCenterContent />;
	},
} );
