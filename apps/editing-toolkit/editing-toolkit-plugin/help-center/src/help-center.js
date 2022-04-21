import HelpCenter, { HelpIcon } from '@automattic/help-center';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { PinnedItems } from '@wordpress/interface';
import { registerPlugin } from '@wordpress/plugins';
import cx from 'classnames';
import { useEffect, useState } from 'react';
import Contents from './contents';
import './help-center.scss';

function HelpCenterComponent() {
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const { show } = useSelect( ( select ) => {
		return {
			show: select( 'automattic/help-center' ).isHelpCenterShown(),
		};
	} );
	const setShowHelpCenter = useDispatch( 'automattic/help-center' )?.setShowHelpCenter;
	const [ selectedArticle, setSelectedArticle ] = useState( null );
	const [ footerContent, setFooterContent ] = useState( null );

	useEffect( () => {
		if ( ! show ) {
			setSelectedArticle( null );
		}
	}, [ show ] );

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
					content={
						<Contents
							selectedArticle={ selectedArticle }
							setSelectedArticle={ setSelectedArticle }
							setFooterContent={ setFooterContent }
						/>
					}
					headerText={ selectedArticle?.title }
					handleClose={ () => setShowHelpCenter( false ) }
					footerContent={ footerContent }
				/>
			) }
		</>
	);
}

registerPlugin( 'etk-help-center', {
	render: () => <HelpCenterComponent />,
} );
