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
				<div>Help Center</div>
				<div>
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

export default HelpCenterMobileHeader;
