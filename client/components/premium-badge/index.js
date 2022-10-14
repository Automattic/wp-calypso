import { Popover } from '@automattic/components';
import { useState } from '@wordpress/element';
import { Icon, starFilled } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import Badge from 'calypso/components/badge';
import { hasTouch } from 'calypso/lib/touch-detect';

import './style.scss';

const PremiumBadge = ( { tooltipText } ) => {
	const { __ } = useI18n();
	const [ popoverAnchor, setPopoverAnchor ] = useState();
	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );

	const isTouch = hasTouch();

	return (
		<>
			<button
				ref={ setPopoverAnchor }
				className="premium-badge"
				onClick={ () => {
					if ( ! isTouch ) {
						return;
					}
					setIsPopoverVisible( ( state ) => ! state );
				} }
				onMouseEnter={ () => {
					if ( isTouch ) {
						return;
					}
					setIsPopoverVisible( true );
				} }
				onMouseLeave={ () => {
					if ( isTouch ) {
						return;
					}
					setIsPopoverVisible( false );
				} }
				type="button"
			>
				<Badge type="info">
					<Icon icon={ starFilled } size={ 18 } />
					<span>{ __( 'Premium' ) }</span>
				</Badge>
			</button>
			{ tooltipText && (
				<Popover
					className="premium-badge__popover"
					context={ popoverAnchor }
					isVisible={ isPopoverVisible }
					onClose={ () => setIsPopoverVisible( false ) }
				>
					{ tooltipText }
				</Popover>
			) }
		</>
	);
};

export default PremiumBadge;
