import { CardHeader, Button, Flex } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall, chevronUp, lineSolid } from '@wordpress/icons';
import classnames from 'classnames';
import { Header } from './types';

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
				<p style={ { fontSize: 14, fontWeight: 500 } }>{ __( 'Help Center' ) }</p>
				<div>
					{ isMinimized ? (
						<Button
							className={ 'help-center-header__maximize' }
							label={ __( 'Maximize Help Center' ) }
							icon={ chevronUp }
							onClick={ onMaximize }
						/>
					) : (
						<Button
							className={ 'help-center-header__minimize' }
							label={ __( 'Minimize Help Center' ) }
							icon={ lineSolid }
							onClick={ onMinimize }
						/>
					) }

					<Button
						className={ 'help-center-header__close' }
						label={ __( 'Close Help Center' ) }
						icon={ closeSmall }
						onClick={ onDismiss }
					/>
				</div>
			</Flex>
		</CardHeader>
	);
};

export default HelpCenterMobileHeader;
