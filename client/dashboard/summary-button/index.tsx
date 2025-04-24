import {
	Card,
	CardBody,
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
import { SummaryButtonProps, SummaryButtonFieldProps } from './types';
import './style.scss';

const noop = () => {};

function SummaryButton(
	{
		title,
		to,
		decoration,
		description,
		strapline,
		fields,
		leadsToNestedPage = true,
		onClick = noop,
		disabled,
		density = 'low',
	}: SummaryButtonProps,
	ref: React.ForwardedRef< HTMLAnchorElement >
) {
	const hasLowDensity = density === 'low';
	const badges = fields?.length && (
		<HStack spacing={ 1 } justify="flex-start" style={ { minWidth: 'fit-content' } }>
			{ fields?.map( ( field: SummaryButtonFieldProps ) => (
				<CoreBadge key={ field.text } intent={ field.intent || 'default' }>
					{ field.text }
				</CoreBadge>
			) ) }
		</HStack>
	);
	return (
		<Button
			ref={ ref }
			href={ to }
			onClick={ onClick }
			className={ clsx( 'summary-button', `has-density-${ density }` ) }
			disabled={ disabled }
			accessibleWhenDisabled
		>
			<Card className="summary-button-card">
				<CardBody className="summary-button-card-body">
					<HStack spacing={ 4 } justify="space-between" alignment="flex-start">
						<HStack justify="flex-start" spacing={ 2 } alignment="flex-start">
							{ !! decoration && <div className="summary-button-decoration">{ decoration }</div> }
							<VStack alignment="flex-start">
								{ strapline && (
									<Text className="summary-button-strapline" variant="muted" size={ 10 }>
										{ strapline }
									</Text>
								) }
								<Text size={ hasLowDensity ? 18 : 14 } className="summary-button-title">
									{ title }
								</Text>
								{ description && <Text variant="muted">{ description }</Text> }
								{ hasLowDensity && badges }
							</VStack>
						</HStack>
						{ /* // TODO: we might need to consider to add `badges` in the same HStack with the main content
						// and not like here with the chevron icon. */ }
						<HStack justify="flex-end" spacing={ 2 } expanded={ false }>
							{ ! hasLowDensity && badges }
							{ leadsToNestedPage && (
								<Icon icon={ chevronRight } className="summary-button-navigation-icon" />
							) }
						</HStack>
					</HStack>
				</CardBody>
			</Card>
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
