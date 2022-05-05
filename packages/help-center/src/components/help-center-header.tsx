import { CardHeader, Button, Flex } from '@wordpress/components';
import { closeSmall, chevronUp, lineSolid } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React from 'react';
import { Header } from './types';

const HelpCenterMobileHeader: React.FC< Header > = ( {
	isMinimized,
	onMinimize,
	onMaximize,
	onDismiss,
	headerText,
} ) => {
	const classNames = classnames( 'help-center__container-header' );
	const { __ } = useI18n();

	return (
		<CardHeader className={ classNames }>
			<Flex>
				<p style={ { fontSize: 14, fontWeight: 500 } }>{ headerText }</p>
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
