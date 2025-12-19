import { __experimentalVStack as VStack, Icon } from '@wordpress/components';
import { throttle } from '@wordpress/compose';
import { Field, View } from '@wordpress/dataviews';
import { _n, sprintf } from '@wordpress/i18n';
import { plugins as pluginIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { pluginRoute } from '../../../app/router/plugins';
import { Card, CardBody } from '../../../components/card';
import SwitcherContent from '../../../components/switcher/switcher-content';
import { Text } from '../../../components/text';
import { PluginListRow } from '../types';

import './plugin-switcher.scss';

const ICON_SIZE = 52;
const FALLBACK_ICON_SIZE = 39;

export const PluginSwitcher = ( {
	pluginsWithIcon,
	searchableFields,
	selectedPluginSlug = '',
	view,
	onChangeView,
	paginationInfo,
}: {
	pluginsWithIcon: PluginListRow[];
	searchableFields: Field< PluginListRow >[];
	selectedPluginSlug?: string;
	view: View;
	onChangeView: Dispatch< SetStateAction< View > >;
	paginationInfo: { totalItems: number; totalPages: number };
} ) => {
	const scrollRef = useRef< HTMLDivElement >( null );
	const [ itemsPerPage ] = useState( view.perPage );

	// Load next page when scrolling near bottom
	const handleLoadMore = useCallback( () => {
		if ( ! paginationInfo ) {
			return;
		}

		if ( paginationInfo.totalPages > 1 ) {
			onChangeView( ( currentView ) => ( {
				...currentView,
				// @ts-expect-error: perPage can't be undefined
				perPage: currentView.perPage + itemsPerPage, // Accumulate items
			} ) );
		}
	}, [ paginationInfo, onChangeView, itemsPerPage ] );

	// Set up scroll listener
	useEffect( () => {
		const menuElement = scrollRef.current;

		if ( ! menuElement || ! paginationInfo ) {
			return;
		}

		const handleScroll = throttle( () => {
			const scrollTop = menuElement.scrollTop;
			const scrollHeight = menuElement.scrollHeight;
			const clientHeight = menuElement.clientHeight;
			// Load more when within 100px of bottom
			if ( scrollTop + clientHeight >= scrollHeight - 100 ) {
				handleLoadMore();
			}
		}, 100 );

		// Initial check in case content is shorter than container
		handleScroll();

		menuElement.addEventListener( 'scroll', handleScroll );
		return () => menuElement.removeEventListener( 'scroll', handleScroll );
	}, [ handleLoadMore, paginationInfo ] );

	const itemClassName = useCallback(
		( item: PluginListRow ) =>
			clsx( 'plugin-switcher-item', {
				'is-selected': selectedPluginSlug === item.slug,
			} ),
		[ selectedPluginSlug ]
	);

	const renderItemMedia = useCallback( ( { item }: { item: PluginListRow } ) => {
		const icon = item.icon ? (
			<img src={ item.icon } alt={ item.name } width={ ICON_SIZE } height={ ICON_SIZE } />
		) : (
			<Icon icon={ pluginIcon } size={ FALLBACK_ICON_SIZE } className="plugin-icon-fallback" />
		);

		return (
			<div className={ clsx( 'plugin-icon-wrapper', { 'is-fallback': ! item.icon } ) }>
				{ icon }
			</div>
		);
	}, [] );

	const renderItemTitle = useCallback( ( { item }: { item: PluginListRow } ) => {
		const sitesText = sprintf(
			// translators: %(siteCount)d is the number of sites the plugin is installed on.
			_n( '%(siteCount)d site', '%(siteCount)d sites', item.sitesCount ),
			{ siteCount: item.sitesCount }
		);

		const updatesText = item.sitesWithPluginUpdate.length
			? sprintf(
					// translators: %(updateCount)d is the number of updates available.
					_n(
						'%(updateCount)d update available',
						'%(updateCount)d updates available',
						item.sitesWithPluginUpdate.length
					),
					{ updateCount: item.sitesWithPluginUpdate.length }
			  )
			: '';

		return (
			<VStack spacing={ 1 }>
				{ /* @ts-expect-error: Can only set one of `children` or `props.dangerouslySetInnerHTML`. */ }
				<Text
					className="plugin-switcher-item-name"
					dangerouslySetInnerHTML={ { __html: item.name } }
					title={ item.name }
				/>
				<Text className="plugin-switcher-item-site-count" variant="muted">
					{ updatesText ? `${ sitesText }, ${ updatesText }` : sitesText }
				</Text>
			</VStack>
		);
	}, [] );

	return (
		<Card>
			<CardBody className="plugin-switcher-card-body" ref={ scrollRef }>
				<SwitcherContent
					itemAlignment="start"
					itemClassName={ itemClassName }
					itemSpacing={ 3 }
					searchClassName="plugin-switcher-search"
					view={ view }
					onChangeView={ onChangeView }
					items={ pluginsWithIcon }
					resetScroll={ false }
					getItemUrl={ ( item ) => pluginRoute.to.replace( '$pluginId', item.slug ) }
					renderItemMedia={ renderItemMedia }
					renderItemTitle={ renderItemTitle }
					searchableFields={ searchableFields }
					onClose={ () => {} }
					width="auto"
				/>
			</CardBody>
		</Card>
	);
};
