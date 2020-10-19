/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Button } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	onClose?: () => void;
}

const Launch: React.FunctionComponent< Props > = ( { onClose } ) => {
	const { __ } = useI18n();

	return (
		<div className={ classnames( 'nux-launch' ) }>
			<p>{ __( 'Launch' ) }</p>
			<Button onClick={ onClose }>
				<Icon icon={ close } size={ 24 } />
			</Button>
		</div>
	);
};

export default Launch;
