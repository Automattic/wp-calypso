import { Gridicon } from '@automattic/components';
import { useState, useEffect } from 'react';
import type { CONVERSION_ACTION } from '../../hooks/use-define-conversion-action';

interface Props {
	conversionAction?: CONVERSION_ACTION;
}
export default function StatusIcon( props: Props ) {
	const { conversionAction } = props;
	const [ statusIcon, setStatusIcon ] = useState( '' );
	const [ statusColor, setStatusColor ] = useState( '' );

	useEffect( () => {
		switch ( conversionAction ) {
			case 'idle':
				setStatusIcon( 'checkmark' );
				setStatusColor( 'green' );
				break;
			case 'transfer-domain':
			case 'transfer-hosting':
			case 'transfer-google-domain':
			case 'transfer-google-domain-hosting':
			case 'transfer-domain-hosting':
				setStatusIcon( 'cross' );
				setStatusColor( 'red' );
				break;
			case 'register-domain':
			default:
				setStatusIcon( 'checkmark' );
				setStatusColor( 'blue' );
				break;
		}
	}, [ conversionAction ] );

	if ( ! conversionAction ) {
		return null;
	}

	return (
		<span className={ `status-icon ${ statusColor }` }>
			<Gridicon icon={ statusIcon } size={ 18 } />
		</span>
	);
}
