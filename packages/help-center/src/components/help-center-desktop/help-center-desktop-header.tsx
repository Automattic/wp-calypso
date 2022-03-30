import { CardHeader, Button, Flex } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, chevronUp, lineSolid } from '@wordpress/icons';
import classnames from 'classnames';

interface Props {
	isMinimized: boolean;
	onMinimize: () => void;
	onMaximize: () => void;
	onDismiss: () => void;
}

const HelpCenterDesktopHeader: React.FC< Props > = ( {
	isMinimized,
	onMinimize,
	onMaximize,
	onDismiss,
} ) => {
	const classNames = classnames( 'help-center__container-header' );

	return (
		<CardHeader className={ classNames }>
			<Flex>
				<div>Help Center</div>
				<div>
					{ isMinimized ? (
						<Button
							label={ __( 'Maximize Help Center' ) }
							icon={ chevronUp }
							iconSize={ 24 }
							onClick={ onMaximize }
						></Button>
					) : (
						<Button
							label={ __( 'Minimize Help Center' ) }
							icon={ lineSolid }
							iconSize={ 24 }
							onClick={ onMinimize }
						></Button>
					) }

					<Button
						label={ __( 'Close Help Center' ) }
						icon={ close }
						iconSize={ 24 }
						onClick={ onDismiss }
					></Button>
				</div>
			</Flex>
		</CardHeader>
	);
};

export default HelpCenterDesktopHeader;
