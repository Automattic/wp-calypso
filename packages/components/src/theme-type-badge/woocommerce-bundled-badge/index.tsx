import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { FunctionComponent, useRef, useMemo, useState } from 'react';
import Popover from '../../popover';

import './style.scss';

interface Props {
	className?: string;
	tooltipContent?: React.ReactElement;
	tooltipClassName?: string;
	tooltipPosition?: string;
	focusOnShow?: boolean;
	isClickable?: boolean;
}

const WooCommerceBundledBadge: FunctionComponent< Props > = ( {
	className,
	tooltipContent,
	tooltipClassName,
	tooltipPosition = 'bottom right',
	focusOnShow,
	isClickable,
} ) => {
	const { __ } = useI18n();

	const tooltipText = __(
		'This theme comes bundled with WooCommerce, the best way to sell online.',
		__i18n_text_domain__
	);

	const divRef = useRef( null );
	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );
	const [ isPressed, setIsPressed ] = useState( false );

	const isClickableProps = useMemo( () => {
		if ( ! isClickable ) {
			return {};
		}

		return {
			role: 'button',
			tabIndex: 0,
			onBlur: () => {
				setIsPressed( false );
				setIsPopoverVisible( false );
			},
			onClick: () => {
				setIsPressed( ! isPopoverVisible );
				setIsPopoverVisible( ! isPopoverVisible );
			},
			onKeyDown: ( event: React.KeyboardEvent ) => {
				if ( event.key === 'Enter' || event.key === ' ' ) {
					event.preventDefault();
					setIsPressed( ! isPopoverVisible );
					setIsPopoverVisible( ! isPopoverVisible );
				}
			},
		};
	}, [ isClickable, isPopoverVisible ] );

	return (
		<div
			className={ classNames( 'woocommerce-bundled-badge', className, {
				'woocommerce-bundled-badge--is-clickable': isClickable,
			} ) }
			ref={ divRef }
			onMouseEnter={ () => {
				if ( ! isPressed ) {
					setIsPopoverVisible( true );
				}
			} }
			onMouseLeave={ () => {
				if ( ! isPressed ) {
					setIsPopoverVisible( false );
				}
			} }
			{ ...isClickableProps }
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				id="Layer_1"
				data-name="Layer 1"
				width="24"
				height="24"
				viewBox="0 0 148.5 148.5"
			>
				<rect className="cls-1" width="148.5" height="148.5" rx="15" />
				<path
					className="cls-2"
					d="M26.08,42.22H123A11.08,11.08,0,0,1,134,53.31v37A11.08,11.08,0,0,1,123,101.38H88.21L93,113.06,72,101.38H26.13A11.08,11.08,0,0,1,15,90.29v-37A11,11,0,0,1,26.08,42.22Z"
					transform="translate(-0.89 -0.9)"
				/>
				<path
					className="cls-1"
					d="M21.81,52.33a3.92,3.92,0,0,1,3.05-1.5q3.7-.28,4.21,3.49Q31.32,69.49,34,80L44.55,59.83q1.46-2.76,3.63-2.9c2.13-.15,3.43,1.21,4,4.06a90.37,90.37,0,0,0,4.59,16.55C58,65.25,60.13,56.4,63.13,50.93a3.71,3.71,0,0,1,3.19-2.13,4.18,4.18,0,0,1,3.05,1,3.78,3.78,0,0,1,1.5,2.76,4.16,4.16,0,0,1-.49,2.32C68.5,58.33,67,64.18,65.69,72.31c-1.21,7.89-1.64,14-1.35,18.43a5.86,5.86,0,0,1-.58,3.2,3.14,3.14,0,0,1-2.57,1.74,4.9,4.9,0,0,1-3.82-1.79Q50.62,87,46.68,73.28q-4.73,9.28-7,13.93c-2.85,5.47-5.27,8.27-7.3,8.42-1.31.1-2.42-1-3.39-3.34q-3.69-9.51-8-36.72a4.17,4.17,0,0,1,.77-3.24Zm104,7.6A11.1,11.1,0,0,0,118,54.32a12.27,12.27,0,0,0-2.61-.29q-7,0-11.37,7.25a25.68,25.68,0,0,0-3.77,13.64,18.7,18.7,0,0,0,2.32,9.58,11.12,11.12,0,0,0,7.74,5.61,12.27,12.27,0,0,0,2.61.29c4.7,0,8.47-2.41,11.37-7.25a25.89,25.89,0,0,0,3.78-13.69,17.89,17.89,0,0,0-2.33-9.53Zm-6.09,13.4A12.84,12.84,0,0,1,116,80.49c-1.4,1.25-2.71,1.79-3.92,1.54s-2.13-1.25-2.85-3.14a12.29,12.29,0,0,1-.87-4.4A16.91,16.91,0,0,1,108.7,71a15.46,15.46,0,0,1,2.56-5.76c1.6-2.37,3.29-3.34,5-3,1.16.24,2.13,1.26,2.86,3.15a12.21,12.21,0,0,1,.87,4.4,17.13,17.13,0,0,1-.34,3.58ZM95.49,59.93a11.2,11.2,0,0,0-7.74-5.61A12.27,12.27,0,0,0,85.14,54c-4.65,0-8.42,2.41-11.37,7.25A25.59,25.59,0,0,0,70,74.92a18.7,18.7,0,0,0,2.32,9.58,11.1,11.1,0,0,0,7.74,5.61,12.27,12.27,0,0,0,2.61.29q7,0,11.37-7.25a26,26,0,0,0,3.77-13.69,18.26,18.26,0,0,0-2.32-9.53Zm-6.14,13.4a12.84,12.84,0,0,1-3.68,7.16C84.27,81.74,83,82.28,81.75,82s-2.13-1.25-2.85-3.14a12.29,12.29,0,0,1-.87-4.4A16.27,16.27,0,0,1,78.37,71a15.46,15.46,0,0,1,2.56-5.76c1.6-2.37,3.29-3.34,5-3,1.16.24,2.13,1.26,2.85,3.15a12,12,0,0,1,.88,4.4,14.81,14.81,0,0,1-.34,3.58Z"
					transform="translate(-0.89 -0.9)"
				/>
			</svg>
			<span>WooCommerce</span>
			<Popover
				className={ classNames( 'woocommerce-bundled-badge__popover', tooltipClassName ) }
				context={ divRef.current }
				isVisible={ isPopoverVisible }
				position={ tooltipPosition }
				focusOnShow={ focusOnShow }
			>
				{ tooltipContent || tooltipText }
			</Popover>
		</div>
	);
};

export default WooCommerceBundledBadge;
