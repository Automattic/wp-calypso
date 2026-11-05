import { DomainSubtype } from '@automattic/api-core';
import {
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch, useRegistry } from '@wordpress/data';
import { DataViews as WPDataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useId, useState } from 'react';
import { Card, CardBody, CardFooter } from '../../components/card';
import { DataViewsActionModal } from '../../components/dataviews';
import Grid from '../../components/grid';
import { Text } from '../../components/text';
import { PrimaryDomainBadge, useDomainNameNote } from './field-domain-name';
import { getDomainId, textOverflowStyles } from './utils';
import type { GapSize } from '../../components/grid';
import type { DomainSummary, Site } from '@automattic/api-core';
import type {
	Action,
	ActionModal,
	Density,
	Field,
	NormalizedField,
	ViewGrid,
} from '@wordpress/dataviews';

import './domain-cards.scss';

/*
 * At most three cards per row, with fewer when they would drop below 280px. The 64px is two gutters of the largest
 * gap in `GAP_BY_DENSITY`, so wide containers always fit three tracks and never a fourth. `1fr` takes up any space left over.
 */
const GRID_TEMPLATE_COLUMNS =
	'repeat( auto-fill, minmax( max( min( 280px, 100% ), calc( ( 100% - 64px ) / 3 ) ), 1fr ) )';

const GAP_BY_DENSITY: Record< Density, GapSize > = {
	compact: 'lg',
	balanced: 'xl',
	comfortable: '2xl',
};

function getActionLabel( action: Action< DomainSummary >, item: DomainSummary ) {
	return typeof action.label === 'function' ? action.label( [ item ] ) : action.label;
}

/*
 * Every renewable domain is eligible for "Renew", so it only moves to the footer once the domain has expired.
 * That's also when DNS stops being what the domain needs next, so it leaves the footer for the menu.
 */
function getFooterActionIds( item: DomainSummary ) {
	return [
		'manage-domain',
		item.expired ? 'renew' : 'manage-dns-settings',
		'change-primary-domain',
	];
}

function getFooterActionLabel( action: Action< DomainSummary >, item: DomainSummary ) {
	if ( action.id === 'manage-dns-settings' ) {
		return __( 'DNS' );
	}
	// A transfer's "View transfer" says where it goes, which isn't its settings.
	if ( action.id === 'manage-domain' && item.subtype.id !== DomainSubtype.DOMAIN_TRANSFER ) {
		return __( 'Settings' );
	}
	return getActionLabel( action, item );
}

function DomainCard( {
	item,
	site,
	fields,
	actions,
}: {
	item: DomainSummary;
	site?: Site;
	fields: Field< DomainSummary >[];
	actions: Action< DomainSummary >[];
} ) {
	const registry = useRegistry();
	const { createErrorNotice } = useDispatch( noticesStore );
	const titleId = useId();
	// The primary address only means something when looking at that site's own domains.
	const isPrimaryOnSite = !! site && item.primary_domain;
	const note = useDomainNameNote( item, isPrimaryOnSite );
	const [ activeModalAction, setActiveModalAction ] =
		useState< ActionModal< DomainSummary > | null >( null );

	const runAction = ( action: Action< DomainSummary > ) => {
		if ( 'RenderModal' in action ) {
			setActiveModalAction( action );
			return;
		}
		try {
			action.callback( [ item ], { registry } );
		} catch {
			createErrorNotice( __( 'Something went wrong. Please try again.' ), { type: 'snackbar' } );
		}
	};

	const eligibleActions = actions.filter(
		( action ) => ! action.isEligible || action.isEligible( item )
	);
	const footerActionIds = getFooterActionIds( item );
	const footerActions = footerActionIds.flatMap(
		( id ) => eligibleActions.find( ( action ) => action.id === id ) ?? []
	);
	const menuActions = eligibleActions.filter(
		( action ) => ! footerActionIds.includes( action.id )
	);

	return (
		<Card className="domain-cards__card" size="small" role="group" aria-labelledby={ titleId }>
			<CardBody className="domain-cards__body">
				<HStack alignment="topLeft" spacing={ 2 }>
					<VStack className="domain-cards__title" spacing={ 1 }>
						<Heading
							id={ titleId }
							level={ 3 }
							size={ 14 }
							weight={ 500 }
							title={ item.domain }
							style={ textOverflowStyles }
						>
							{ /* Always mounted, even when empty, to dodge a Google Translate DOM crash (react/react#11538). */ }
							<Text variant="muted" weight="inherit">
								{ isPrimaryOnSite && item.primary_is_www ? 'www.' : '' }
							</Text>
							{ item.domain }
						</Heading>
						{ isPrimaryOnSite && <PrimaryDomainBadge /> }
						{ note && (
							<Text variant="muted" truncate>
								{ note }
							</Text>
						) }
					</VStack>
					{ menuActions.length > 0 && (
						<DropdownMenu
							icon={ moreVertical }
							label={ __( 'Actions' ) }
							toggleProps={ {
								__next40pxDefaultSize: true,
								size: 'small',
								'aria-describedby': titleId,
							} }
							popoverProps={ { placement: 'bottom-end' } }
						>
							{ ( { onClose } ) => (
								<MenuGroup>
									{ menuActions.map( ( action ) => (
										<MenuItem
											key={ action.id }
											disabled={ !! action.disabled }
											onClick={ () => {
												onClose();
												runAction( action );
											} }
										>
											{ getActionLabel( action, item ) }
										</MenuItem>
									) ) }
								</MenuGroup>
							) }
						</DropdownMenu>
					) }
				</HStack>
				<dl className="domain-cards__fields">
					{ fields.map(
						( field ) =>
							field.render && (
								<div key={ field.id } className="domain-cards__field">
									<dt>{ field.label }</dt>
									<dd>
										{ /* `useFields` renderers only read `getValue` from the field, which they all define. */ }
										<field.render
											item={ item }
											field={ field as NormalizedField< DomainSummary > }
										/>
									</dd>
								</div>
							)
					) }
				</dl>
			</CardBody>
			{ footerActions.length > 0 && (
				<CardFooter
					justify="flex-start"
					gap={ 4 }
					size={ {
						blockStart: 'none',
						blockEnd: 'small',
						inlineStart: 'small',
						inlineEnd: 'small',
					} }
					isBorderless
				>
					{ footerActions.map( ( action ) => (
						<Button
							key={ action.id }
							__next40pxDefaultSize
							variant="link"
							aria-describedby={ titleId }
							onClick={ () => runAction( action ) }
						>
							{ getFooterActionLabel( action, item ) }
						</Button>
					) ) }
				</CardFooter>
			) }
			{ activeModalAction && (
				<DataViewsActionModal
					action={ activeModalAction }
					item={ item }
					onClose={ () => setActiveModalAction( null ) }
				/>
			) }
		</Card>
	);
}

/**
 * The grid layout for domain lists, composed from DataViews' public subcomponents.
 * The native grid can't omit its media slot and hides primary actions in a menu.
 * Must be rendered as a child of `DataViews`.
 */
export function DomainCardsLayout( {
	data,
	fields,
	actions,
	view,
	site,
}: {
	data: DomainSummary[];
	fields: Field< DomainSummary >[];
	actions: Action< DomainSummary >[];
	view: ViewGrid;
	site?: Site;
} ) {
	const visibleFields = ( view.fields ?? [] ).flatMap(
		( id ) => fields.find( ( field ) => field.id === id ) ?? []
	);

	return (
		<>
			{ /* These class names give the toolbar the same padding as DataViews' default composition. */ }
			<HStack className="dataviews__view-actions" alignment="top" justify="space-between">
				<HStack className="dataviews__search" justify="flex-start" expanded={ false }>
					<WPDataViews.Search />
					<WPDataViews.FiltersToggle />
				</HStack>
				<HStack justify="flex-end" expanded={ false } spacing={ 1 }>
					<WPDataViews.LayoutSwitcher />
					<WPDataViews.ViewConfig />
				</HStack>
			</HStack>
			<WPDataViews.FiltersToggled className="dataviews-filters__container" />
			{ data.length > 0 ? (
				<Grid
					className="domain-cards"
					templateColumns={ GRID_TEMPLATE_COLUMNS }
					gap={ GAP_BY_DENSITY[ view.layout?.density ?? 'balanced' ] }
				>
					{ data.map( ( item ) => (
						<DomainCard
							key={ getDomainId( item ) }
							item={ item }
							site={ site }
							fields={ visibleFields }
							actions={ actions }
						/>
					) ) }
				</Grid>
			) : (
				<WPDataViews.Layout />
			) }
			<WPDataViews.Footer />
		</>
	);
}
