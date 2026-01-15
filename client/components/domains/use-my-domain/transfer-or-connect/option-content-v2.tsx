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

import '../style.scss';

type OptionContentV2Props = {
	benefits?: ReadonlyArray< ReactNode >;
	disabled?: boolean;
	illustration: ReactElement;
	onSelect?: React.MouseEventHandler;
	isPlaceholder?: boolean;
	recommended?: boolean;
	titleText: string;
	topText: ReactNode;
	etaText?: ReactNode;
};

export default function OptionContentV2( {
	benefits,
	disabled,
	illustration,
	onSelect,
	isPlaceholder,
	recommended,
	titleText,
	topText,
	etaText,
}: OptionContentV2Props ) {
	const isMobile = useBreakpoint( '<480px' );

	return (
		<VStack
			className={ clsx( 'option-content-v2', {
				'option-content-v2--is-placeholder': isPlaceholder,
			} ) }
			spacing={ 0 }
		>
			<SummaryButton
				className="option-content-v2__button"
				title={ titleText }
				description={
					<VStack className="option-content-v2__description">
						<Text variant="muted" className="option-content-v2__top-text">
							{ topText }
						</Text>
						{ etaText && <Text className="option-content-v2__eta-text">{ etaText }</Text> }
					</VStack>
				}
				decoration={ illustration }
				onClick={ onSelect }
				disabled={ disabled || isPlaceholder || ! onSelect }
				badges={ recommended ? [ { text: __( 'Recommended' ), intent: 'success' } ] : undefined }
			/>
			{ benefits && (
				<VStack
					spacing={ 1 }
					className={ clsx( 'option-content-v2__benefits', {
						'option-content-v2__benefits--clickable': ! disabled && ! isPlaceholder && onSelect,
					} ) }
					onClick={ disabled || isPlaceholder || ! onSelect ? undefined : onSelect }
				>
					{ benefits.map( ( benefit, index ) => {
						return (
							<HStack
								className="option-content-v2__benefits-item"
								alignment="left"
								spacing={ isMobile ? 3 : 4 }
								key={ 'benefit-' + index }
							>
								{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
								<Gridicon size={ 18 } icon="checkmark" />
								<Text className="option-content-v2__benefits-item-text">{ benefit }</Text>
							</HStack>
						);
					} ) }
				</VStack>
			) }
		</VStack>
	);
}
