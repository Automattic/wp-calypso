import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { menu } from '@wordpress/icons';
import HeaderBar from '../../components/header-bar';
import SecondaryMenu from '../secondary-menu';

function OmnibarHeader( { onToggleMenu }: { onToggleMenu?: () => void } ) {
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<HeaderBar as="header">
			{ ! isDesktop && <Button icon={ menu } label={ __( 'Menu' ) } onClick={ onToggleMenu } /> }

			<div style={ { flexGrow: 1 } } />
			<div style={ { flexShrink: 0 } }>
				<SecondaryMenu />
			</div>
		</HeaderBar>
	);
}

export default OmnibarHeader;
