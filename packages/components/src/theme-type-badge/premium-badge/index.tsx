import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Gridicon from '../../gridicon';
import Popover from '../../popover';

import './style.scss';

interface BadgeProps {
	className?: string;
	labelText?: string;
	tooltipContent?: string | React.ReactElement;
	tooltipClassName?: string;
	tooltipPosition?: string;
	isPremiumThemeAvailable?: boolean;
	shouldCompactWithAnimation?: boolean;
	shouldHideIcon?: boolean;
	shouldHideTooltip?: boolean;
	focusOnShow?: boolean;
	isClickable?: boolean;
}

const PremiumBadge = ( {
	className,
	labelText: customLabelText,
	tooltipContent,
	tooltipClassName,
	tooltipPosition = 'bottom left',
	isPremiumThemeAvailable,
	shouldCompactWithAnimation,
	shouldHideIcon,
	shouldHideTooltip,
	focusOnShow,
	isClickable,
}: BadgeProps ) => {
	const { __ } = useI18n();

	const tooltipText = isPremiumThemeAvailable
		? __(
				'Let your site stand out from the crowd with a modern and stylish Premium theme. Premium themes are included in your plan.',
				__i18n_text_domain__
		  )
		: __(
				'Let your site stand out from the crowd with a modern and stylish Premium theme.',
				__i18n_text_domain__
		  );

	const divRef = useRef( null );
	const labelRef = useRef< HTMLDivElement >( null );
	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );
	const [ isHovered, setIsHovered ] = useState( false );
	const [ isPressed, setIsPressed ] = useState( false );
	const [ displayLabelAsTooltip, setDisplayLabelAsTooltip ] = useState( false );
	// This is used to prevent the label from being rendered in compact mode before the first render
	// so that the label can be measured in its uncompacted state.
	const [ mayRenderAsCompact, setMayRenderAsCompact ] = useState( false );

	const labelText = customLabelText || __( 'Premium' );

	// Display the label as a tooltip if the tooltip is being hidden and the label is too long.
	useLayoutEffect( () => {
		const scrollWidth = labelRef?.current?.scrollWidth ?? 0;
		const offsetWidth = labelRef?.current?.offsetWidth ?? 0;
		setDisplayLabelAsTooltip( !! shouldHideTooltip && scrollWidth > offsetWidth );
		// Now the dimensions of the label are known, it is safe to render the label in compact mode.
		setMayRenderAsCompact( true );
	}, [ shouldHideTooltip, labelRef ] );

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
			className={ clsx( 'premium-badge', className, {
				'premium-badge__compact-animation': shouldCompactWithAnimation,
				'premium-badge--compact': shouldCompactWithAnimation && ! isHovered && mayRenderAsCompact,
				'premium-badge--is-clickable': isClickable,
			} ) }
			ref={ divRef }
			onMouseEnter={ () => {
				if ( ! isPressed ) {
					setIsPopoverVisible( true );
					setIsHovered( true );
				}
			} }
			onMouseLeave={ () => {
				if ( ! isPressed ) {
					setIsPopoverVisible( false );
					setIsHovered( false );
				}
			} }
			{ ...isClickableProps }
		>
			{ ! shouldHideIcon && (
				<>
					{ /*  eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
					<Gridicon className="premium-badge__logo" icon="star" size={ 14 } />
				</>
			) }
			<span className="premium-badge__label" ref={ labelRef }>
				{ labelText }
			</span>
			{ ! shouldHideTooltip && (
				<Popover
					className={ clsx( 'premium-badge__popover', tooltipClassName ) }
					context={ divRef.current }
					isVisible={ isPopoverVisible }
					position={ tooltipPosition }
					focusOnShow={ focusOnShow }
				>
					{ tooltipContent || tooltipText }
				</Popover>
			) }
			{ displayLabelAsTooltip && (
				<Popover
					className={ clsx( 'premium-badge__popover', tooltipClassName ) }
					context={ divRef.current }
					isVisible={ isPopoverVisible }
					position="bottom"
					focusOnShow={ focusOnShow }
				>
					{ labelText }
				</Popover>
			) }
		</div>
	);
};

export default PremiumBadge;
