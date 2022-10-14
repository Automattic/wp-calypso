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

	const badge = (
		<Badge type="info">
			<Icon icon={ starFilled } size={ 18 } />
			<span>{ __( 'Premium' ) }</span>
		</Badge>
	);

	return (
		<>
			{ tooltipText ? (
				<button
					ref={ setPopoverAnchor }
					className={ classes }
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
					{ badge }
				</button>
			) : (
				<div className={ classes }>{ badge }</div>
			) }
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
