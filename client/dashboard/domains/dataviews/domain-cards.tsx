import { DomainSubtype } from '@automattic/api-core';
import {
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useRegistry } from '@wordpress/data';
import { DataViews as WPDataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { useState } from 'react';
import { Card, CardBody, CardFooter } from '../../components/card';
import { DataViewsActionModal } from '../../components/dataviews';
import Grid from '../../components/grid';
import { DomainNameField } from './field-domain-name';
import type { GapSize } from '../../components/grid';
import type { DomainSummary } from '@automattic/api-core';
import type {
	Action,
	ActionModal,
	Field,
	NormalizedField,
	View,
	ViewGrid,
} from '@wordpress/dataviews';
import type { ReactNode } from 'react';

import './domain-cards.scss';

/*
 * At most three cards per row, with fewer when they would drop below 280px. Subtracting the largest gap
 * always leaves room for three tracks and never for a fourth, and `1fr` takes up any space left over.
 */
const GRID_TEMPLATE_COLUMNS =
	'repeat( auto-fill, minmax( max( min( 280px, 100% ), calc( ( 100% - 64px ) / 3 ) ), 1fr ) )';

const GAP_BY_DENSITY: Record< NonNullable< ViewGrid[ 'layout' ] >[ 'density' ] & string, GapSize > =
	{
		compact: 'lg',
		balanced: 'xl',
		comfortable: '2xl',
	};

function getActionLabel( action: Action< DomainSummary >, item: DomainSummary ) {
	return typeof action.label === 'function' ? action.label( [ item ] ) : action.label;
}

const FOOTER_ACTION_IDS = [ 'manage-domain', 'renew', 'manage-dns-settings' ];

/*
 * Every renewable domain is eligible for "Renew", so it only moves to the footer once the domain has expired.
 * That's also when DNS stops being what the domain needs next, so it leaves the footer for the menu.
 */
function isFooterAction( action: Action< DomainSummary >, item: DomainSummary ) {
	switch ( action.id ) {
		case 'manage-domain':
			return true;
		case 'renew':
			return item.expired;
		case 'manage-dns-settings':
			return ! item.expired;
		default:
			return false;
	}
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
	fields,
	actions,
}: {
	item: DomainSummary;
	fields: Field< DomainSummary >[];
	actions: Action< DomainSummary >[];
} ) {
	const registry = useRegistry();
	const [ activeModalAction, setActiveModalAction ] =
		useState< ActionModal< DomainSummary > | null >( null );

	const runAction = ( action: Action< DomainSummary > ) => {
		if ( 'RenderModal' in action ) {
			setActiveModalAction( action );
			return;
		}
		action.callback( [ item ], { registry } );
	};

	const eligibleActions = actions.filter(
		( action ) => ! action.isEligible || action.isEligible( item )
	);
	const footerActions = FOOTER_ACTION_IDS.flatMap(
		( id ) =>
			eligibleActions.find( ( action ) => action.id === id && isFooterAction( action, item ) ) ?? []
	);
	const menuActions = eligibleActions.filter( ( action ) => ! isFooterAction( action, item ) );

	return (
		<Card className="domain-cards__card" size="small">
			<CardBody className="domain-cards__body">
				<HStack alignment="topLeft" justify="space-between" spacing={ 2 }>
					<div className="domain-cards__title">
						<DomainNameField domain={ item } value={ item.domain } isLinked={ false } />
					</div>
					{ menuActions.length > 0 && (
						<DropdownMenu
							icon={ moreVertical }
							label={ __( 'Actions' ) }
							toggleProps={ { size: 'small' } }
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
				<CardFooter justify="flex-start" size="small" isBorderless>
					<HStack justify="flex-start" spacing={ 4 } expanded={ false }>
						{ footerActions.map( ( action ) => (
							<Button
								key={ action.id }
								variant="link"
								disabled={ !! action.disabled }
								accessibleWhenDisabled
								onClick={ () => runAction( action ) }
							>
								{ getFooterActionLabel( action, item ) }
							</Button>
						) ) }
					</HStack>
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
 * The Domains list's grid layout, composed from DataViews' public subcomponents.
 * The native grid can't omit its media slot and hides primary actions in a menu.
 * Must be rendered as a child of `DataViews`.
 */
export function DomainCardsLayout( {
	data,
	fields,
	actions,
	view,
	empty,
}: {
	data: DomainSummary[];
	fields: Field< DomainSummary >[];
	actions: Action< DomainSummary >[];
	view: View;
	empty: ReactNode;
} ) {
	const layout = view.type === 'grid' ? view.layout : undefined;
	const visibleFields = ( view.fields ?? [] ).flatMap(
		( id ) => fields.find( ( field ) => field.id === id ) ?? []
	);

	return (
		<>
			{ /* These class names give the toolbar the same spacing as DataViews' default composition. */ }
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
					gap={ GAP_BY_DENSITY[ layout?.density ?? 'balanced' ] }
				>
					{ data.map( ( item ) => (
						<DomainCard
							key={ `${ item.domain }-${ item.blog_id }` }
							item={ item }
							fields={ visibleFields }
							actions={ actions }
						/>
					) ) }
				</Grid>
			) : (
				empty
			) }
			<WPDataViews.Footer />
		</>
	);
}
