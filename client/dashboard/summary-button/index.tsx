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
import CoreBadge from 'calypso/components/core/badge';
import { SummaryButtonProps } from './types';
import './style.scss';

function BadgesList( { fields }: { fields: SummaryButtonProps[ 'fields' ] } ) {
	if ( ! fields?.length ) {
		return null;
	}
	return (
		<HStack spacing={ 1 } justify="flex-start" style={ { minWidth: 'fit-content' } }>
			{ fields?.map( ( field ) => (
				<CoreBadge key={ field.text } intent={ field.intent || 'default' }>
					{ field.text }
				</CoreBadge>
			) ) }
		</HStack>
	);
}

function SummaryButton(
	{
		title,
		to,
		decoration,
		description,
		strapline,
		fields,
		leadsToNestedPage = true,
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
			href={ to }
			onClick={ onClick }
			className={ clsx( 'summary-button', `has-density-${ density }` ) }
			disabled={ disabled }
			accessibleWhenDisabled
		>
			<span className="summary-button-contents">
				<HStack spacing={ 4 } justify="space-between" alignment="flex-start" as="span">
					<HStack justify="flex-start" spacing={ 4 } alignment="flex-start" as="span">
						{ !! decoration && <span className="summary-button-decoration">{ decoration }</span> }
						<VStack alignment="flex-start" as="span" spacing={ 3 }>
							{ strapline && (
								<Text variant="muted" size={ 10 } upperCase className="summary-button-strapline">
									{ strapline }
								</Text>
							) }
							<Text className="summary-button-title">{ title }</Text>
							{ description && <Text variant="muted">{ description }</Text> }
							{ hasLowDensity && <BadgesList fields={ fields } /> }
						</VStack>
					</HStack>
					{ /* // TODO: we might need to consider to add `badges` in the same HStack with the main content
						// and not like here with the chevron icon. */ }
					<HStack justify="flex-end" spacing={ 2 } expanded={ false } as="span">
						{ ! hasLowDensity && <BadgesList fields={ fields } /> }
						{ leadsToNestedPage && (
							<Icon icon={ chevronRight } className="summary-button-navigation-icon" />
						) }
					</HStack>
				</HStack>
			</span>
		</Button>
	);
}

/**
 * The SummaryButton component provides a quick overview of a related page
 * (often settings). It includes a title, supporting description, and may
 * optionally display key field values or status indicators (e.g. a “2FA enabled” badge)
 * to surface the current state of settings at a glance.
 */
export default forwardRef( SummaryButton );
