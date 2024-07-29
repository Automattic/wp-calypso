import { Card } from '@automattic/components';
import { Icon, plugins } from '@wordpress/icons';
import clsx from 'clsx';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import PluginCommonActions from '../plugin-common-actions';
import type { Columns, RowFormatterArgs } from '../../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	item: any;
	selectedSite?: SiteDetails;
	rowFormatter: ( args: RowFormatterArgs ) => ReactNode;
	columns: Columns;
	renderActions?: ( args: any ) => ReactElement;
}

export default function PluginCommonCard( {
	item,
	selectedSite,
	rowFormatter,
	columns,
	renderActions,
}: Props ) {
	const columnKeys: { [ key: string ]: boolean } = columns.reduce(
		( obj, cur ) => ( { ...obj, [ cur.key ]: true } ),
		{}
	);

	const showLeftContent = columnKeys[ 'plugin' ];

	return (
		<Card className="plugin-common-card__card" compact>
			<div className="plugin-common-card__columns">
				{ showLeftContent && (
					<>
						<div className="plugin-common-card__left-checkbox">
							{ item?.isSelectable && (
								<FormInputCheckbox
									className="plugin-row-formatter__checkbox"
									id={ item.slug }
									onClick={ item.onClick }
									checked={ item.isSelected }
									readOnly
								/>
							) }
						</div>
						<div className="plugin-common-card__left-content">
							{ item.icon ? (
								<img
									className="plugin-common-card__plugin-icon"
									src={ item.icon }
									alt={ item.name }
								/>
							) : (
								<Icon
									size={ 32 }
									icon={ plugins }
									className="plugin-common-card__plugin-icon plugin-default-icon"
								/>
							) }
						</div>
					</>
				) }
				<div
					className={ clsx( 'plugin-common-card__main-content', {
						'no-padding': ! showLeftContent,
					} ) }
				>
					{ columnKeys[ 'plugin' ] && (
						<div>
							{ rowFormatter( { columnKey: 'plugin', item, isSmallScreen: true } ) }
							<span className="plugin-common-card__overlay"></span>
						</div>
					) }
					{ columnKeys[ 'site-name' ] && (
						<div>
							{ rowFormatter( { columnKey: 'site-name', item } ) }
							<span className="plugin-common-card__overlay"></span>
						</div>
					) }
					{ columnKeys[ 'update' ] &&
						rowFormatter( {
							columnKey: 'update',
							item,
							isSmallScreen: true,
						} ) }
					{ columnKeys[ 'last-updated' ] && (
						<div className="plugin-common-card__site-data">
							{ rowFormatter( {
								columnKey: 'last-updated',
								item,
								isSmallScreen: true,
							} ) }
						</div>
					) }
					{ ( columnKeys[ 'active' ] || columnKeys[ 'autoupdate' ] ) && (
						<div className="plugin-common-card__toggle-container">
							{ columnKeys[ 'activate' ] && (
								<div>
									{ rowFormatter( {
										columnKey: 'activate',
										item,
										isSmallScreen: true,
										selectedSite,
									} ) }
								</div>
							) }
							{ columnKeys[ 'autoupdate' ] && (
								<div>
									{ rowFormatter( {
										columnKey: 'autoupdate',
										item,
										isSmallScreen: true,
										selectedSite,
									} ) }
								</div>
							) }
						</div>
					) }
					{ columnKeys[ 'sites' ] && (
						<div className="plugin-common-card__site-data plugin-common-card__installed-on">
							{ rowFormatter( {
								columnKey: 'sites',
								item,
								isSmallScreen: true,
							} ) }
						</div>
					) }
					{ columnKeys[ 'install' ] && (
						<div className="plugin-common-card__install-button">
							{ rowFormatter( {
								columnKey: 'install',
								item,
								isSmallScreen: true,
							} ) }
						</div>
					) }
				</div>
				{ renderActions && (
					<div className="plugin-common-card__right-content">
						<PluginCommonActions item={ item } renderActions={ renderActions } />
					</div>
				) }
			</div>
		</Card>
	);
}
