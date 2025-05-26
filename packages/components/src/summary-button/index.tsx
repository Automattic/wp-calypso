import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
	Icon,
} from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { CoreBadge } from '../core-badge';
import { SummaryButtonProps } from './types';
import './style.scss';

function BadgesList( { badges }: { badges: SummaryButtonProps[ 'badges' ] } ) {
	if ( ! badges?.length ) {
		return null;
	}
	return (
		<HStack spacing={ 1 } justify="flex-start" as="span" wrap expanded={ false }>
			{ badges?.map( ( badge ) => (
				<CoreBadge key={ badge.text } intent={ badge.intent }>
					{ badge.text }
				</CoreBadge>
			) ) }
		</HStack>
	);
}

function UnforwardedSummaryButton(
	{
		title,
		href,
		decoration,
		description,
		strapline,
		badges,
		showArrow = true,
		onClick,
		disabled,
		density = 'low',
	}: SummaryButtonProps,
	ref: React.ForwardedRef< HTMLAnchorElement | HTMLButtonElement >
) {
	const hasLowDensity = density === 'low';
	return (
		<Button
			ref={ ref }
			href={ href }
			onClick={ onClick }
			className={ clsx( 'summary-button', `has-density-${ density }` ) }
			disabled={ disabled }
			accessibleWhenDisabled
		>
			<HStack spacing={ 4 } justify="flex-start" alignment="flex-start" as="span">
				{ !! decoration && <span className="summary-button-decoration">{ decoration }</span> }
				<HStack justify="space-between" spacing={ 4 } as="span" wrap>
					<VStack alignment="flex-start" as="span" spacing={ 3 } justify="flex-start">
						<VStack alignment="flex-start" as="span" spacing={ 2 } justify="flex-start">
							{ strapline && hasLowDensity && (
								<Text variant="muted" size={ 10 } upperCase className="summary-button-strapline">
									{ strapline }
								</Text>
							) }
							<Text className="summary-button-title">{ title }</Text>
							{ description && hasLowDensity && <Text variant="muted">{ description }</Text> }
						</VStack>
						{ hasLowDensity && <BadgesList badges={ badges } /> }
					</VStack>
					{ ! hasLowDensity && <BadgesList badges={ badges } /> }
				</HStack>
				{ showArrow && <Icon icon={ chevronRight } className="summary-button-navigation-icon" /> }
			</HStack>
		</Button>
	);
}

export const SummaryButton = forwardRef( UnforwardedSummaryButton );

/**
 * The SummaryButton component provides a quick overview of a related page
 * (often settings). It includes a title, supporting description, and may
 * optionally display key field values or status indicators (e.g. a "2FA enabled" badge)
 * to surface the current state of settings at a glance.
 */
export default SummaryButton;
