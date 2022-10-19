import { Popover } from '@automattic/components';
import { useState } from '@wordpress/element';
import { Icon, starFilled } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import Badge from 'calypso/components/badge';
import { hasTouch } from 'calypso/lib/touch-detect';

import './style.scss';

const PremiumBadge = ( { className, tooltipText } ) => {
	const { __ } = useI18n();
	const [ popoverAnchor, setPopoverAnchor ] = useState();
	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );

	const isTouch = hasTouch();

	const classes = classNames( 'premium-badge', className );

	return (
		<>
			<div
				role="button"
				tabIndex={ 0 }
				ref={ setPopoverAnchor }
				className={ classes }
				onClick={ () => {
					if ( ! isTouch ) {
						return;
					}
					setIsPopoverVisible( ( state ) => ! state );
				} }
				onKeyDown={ ( e ) => {
					if ( e.key === 'Space' || e.key === 'Enter' ) {
						// Prevent the event from bubbling to the parent button.
						e.stopPropagation();
						setIsPopoverVisible( ( state ) => ! state );
					}
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
			>
				<Badge type="info">
					<Icon icon={ starFilled } size={ 18 } />
					<span>{ __( 'Premium' ) }</span>
				</Badge>
			</div>
			<Popover
				className="premium-badge__popover"
				context={ popoverAnchor }
				isVisible={ isPopoverVisible }
				onClose={ () => setIsPopoverVisible( false ) }
			>
				{ tooltipText }
			</Popover>
		</>
	);
};

export default PremiumBadge;
