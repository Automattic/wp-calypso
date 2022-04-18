import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { PinnedItems } from '@wordpress/interface';
import { registerPlugin } from '@wordpress/plugins';
import cx from 'classnames';
import './help-center.scss';

function HelpCenterComponent() {
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const { show } = useSelect( ( select ) => {
		return {
			show: select( 'automattic/help-center' ).isHelpCenterShown(),
		};
	} );
	const setShowHelpCenter = useDispatch( 'automattic/help-center' )?.setShowHelpCenter;

	return (
		<>
			{ isDesktop && (
				<PinnedItems scope="core/edit-post">
					<span className="etk-help-center">
						<Button
							className={ cx( 'entry-point-button', { 'is-active': show } ) }
							onClick={ () => setShowHelpCenter( ! show ) }
							icon={ <HelpIcon newItems active={ show } /> }
						></Button>
					</span>
				</PinnedItems>
			) }
			{ show && (
				<HelpCenter
					content={ <h1>Help center</h1> }
					handleClose={ () => setShowHelpCenter( false ) }
				/>
			) }
		</>
	);
}

registerPlugin( 'etk-help-center', {
	render: () => <HelpCenterComponent />,
} );
