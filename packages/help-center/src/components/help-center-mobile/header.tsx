import { CardHeader, Button, Flex } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import classnames from 'classnames';
import { Header } from '../types';

const HelpCenterMobileHeader: React.FC< Header > = ( { onDismiss } ) => {
	const classNames = classnames( 'help-center__container-header' );

	return (
		<CardHeader className={ classNames }>
			<Flex>
				<h2>{ __( 'Help Center' ) }</h2>
				<div>
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

export default HelpCenterMobileHeader;
