import { CardHeader, Button, Flex } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import classnames from 'classnames';
import { maximize, minimize } from '../../icons';

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
							isPrimary
							icon={ maximize }
							iconSize={ 24 }
							onClick={ onMaximize }
						></Button>
					) : (
						<Button
							label={ __( 'Minimize Help Center' ) }
							isPrimary
							icon={ minimize }
							iconSize={ 24 }
							onClick={ onMinimize }
						></Button>
					) }

					<Button
						label={ __( 'Close Help Center' ) }
						isPrimary
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
