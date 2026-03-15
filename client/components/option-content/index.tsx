import { Gridicon, SummaryButton } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import type { ReactNode, ReactElement } from 'react';

import './style.scss';

interface OptionContentProps {
	benefits?: ReadonlyArray< ReactNode >;
	disabled?: boolean;
	illustration: ReactElement;
	onSelect?: React.MouseEventHandler;
	href?: string;
	isPlaceholder?: boolean;
	recommended?: boolean;
	titleText: string;
	topText: ReactNode;
	etaText?: ReactNode;
}

export function OptionContent( {
	benefits,
	disabled,
	illustration,
	onSelect,
	href,
	isPlaceholder,
	recommended,
	titleText,
	topText,
	etaText,
}: OptionContentProps ) {
	const isMobile = useBreakpoint( '<480px' );
	const noAction = ! onSelect && ! href;

	return (
		<VStack
			className={ clsx( 'option-content', {
				'option-content--is-placeholder': isPlaceholder,
			} ) }
			spacing={ 0 }
		>
			<SummaryButton
				className="option-content__button"
				title={ titleText }
				description={
					<VStack className="option-content__description">
						<Text variant="muted" className="option-content__top-text">
							{ topText }
						</Text>
						{ etaText && <Text className="option-content__eta-text">{ etaText }</Text> }
					</VStack>
				}
				decoration={ illustration }
				onClick={ onSelect }
				href={ href }
				disabled={ disabled || isPlaceholder || noAction }
				badges={ recommended ? [ { text: __( 'Recommended' ), intent: 'success' } ] : undefined }
			/>
			{ benefits && (
				<VStack
					as={ href ? 'a' : 'button' }
					tabIndex={ -1 }
					href={ href }
					spacing={ 1 }
					className={ clsx( 'option-content__benefits', {
						'option-content__benefits--clickable': ! disabled && ! isPlaceholder && ! noAction,
					} ) }
					onClick={ disabled || isPlaceholder || noAction ? undefined : onSelect }
				>
					{ benefits.map( ( benefit, index ) => {
						return (
							<HStack
								className="option-content__benefits-item"
								alignment="left"
								spacing={ isMobile ? 1 : 2 }
								key={ 'benefit-' + index }
							>
								{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
								<Gridicon size={ 18 } icon="checkmark" />
								<Text className="option-content__benefits-item-text">{ benefit }</Text>
							</HStack>
						);
					} ) }
				</VStack>
			) }
		</VStack>
	);
}
