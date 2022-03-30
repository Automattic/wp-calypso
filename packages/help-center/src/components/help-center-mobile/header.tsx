import { CardHeader, Button, Flex } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, chevronUp, lineSolid } from '@wordpress/icons';
import classnames from 'classnames';
import { Header } from '../types';

const HelpCenterMobileHeader: React.FC< Header > = ( {
	isMinimized,
	onMinimize,
	onMaximize,
	onDismiss,
} ) => {
	const classNames = classnames( 'help-center__container-header' );

	return (
		<CardHeader className={ classNames }>
			<Flex>
				<h2>{ __( 'Help Center' ) }</h2>
				<div>
					<div>
						{ isMinimized ? (
							<Button
								label={ __( 'Maximize Help Center' ) }
								icon={ chevronUp }
								iconSize={ 24 }
								onClick={ onMaximize }
							/>
						) : (
							<Button
								label={ __( 'Minimize Help Center' ) }
								icon={ lineSolid }
								iconSize={ 24 }
								onClick={ onMinimize }
							/>
						) }

						<Button
							label={ __( 'Close Help Center' ) }
							icon={ close }
							iconSize={ 24 }
							onClick={ onDismiss }
						/>
					</div>
				</div>
			</Flex>
		</CardHeader>
	);
};

export default HelpCenterMobileHeader;
