import { Card } from '@wordpress/components';
import classnames from 'classnames';
import { ReactElement, useState } from 'react';
import Draggable from 'react-draggable';
import HelpCenterDesktopContent from './help-center-desktop-content';
import HelpCenterDesktopFooter from './help-center-desktop-footer';
import HelpCenterDesktopHeader from './help-center-desktop-header';

interface Props {
	content: ReactElement;
	handleClose: () => void;
}

const HelpCenterDeskopContainer: React.FC< Props > = ( { content, handleClose } ) => {
	const [ isMinimized, setIsMinimized ] = useState( false );
	const classNames = classnames( 'help-center__container', 'is-desktop', {
		'is-minimized': isMinimized,
	} );

	const container = (
		<Card className={ classNames }>
			<HelpCenterDesktopHeader
				isMinimized={ isMinimized }
				onMinimize={ () => setIsMinimized( true ) }
				onMaximize={ () => setIsMinimized( false ) }
				onDismiss={ handleClose }
			/>
			{ ! isMinimized && (
				<>
					<HelpCenterDesktopContent content={ content } />
					<HelpCenterDesktopFooter />
				</>
			) }
		</Card>
	);

	return isMinimized ? container : <Draggable>{ container }</Draggable>;
};

export default HelpCenterDeskopContainer;
