import {
	__experimentalText as Text,
	CheckboxControl,
	SearchControl,
	Spinner,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useCallback, useEffect, useState, useMemo } from 'react';
import { MAX_SELECTABLE_PLUGINS } from './config';
import type { CorePlugin } from 'calypso/data/plugins/types';

interface Props {
	plugins?: CorePlugin[];
	isPluginsFetching: boolean;
	isPluginsFetched: boolean;
	selectedPlugins?: string[];
	touched?: boolean;
	error?: string;
	showError?: boolean;
	onTouch?: ( touched: boolean ) => void;
	onChange?: ( value: string[] ) => void;
	borderWrapper?: boolean;
	selectedSites?: number[] | null;
}
export function ScheduleFormPlugins( props: Props ) {
	const {
		selectedPlugins: initSelectedPlugins = [],
		isPluginsFetching,
		isPluginsFetched,
		error,
		showError,
		onChange,
		onTouch,
		borderWrapper = true,
		selectedSites = null,
	} = props;
	const translate = useTranslate();
	const plugins = useMemo( () => props.plugins || [], [ props.plugins ] );
	const pluginsAvailable = props.plugins !== undefined || isPluginsFetching;

	const [ pluginSearchTerm, setPluginSearchTerm ] = useState( '' );
	const [ selectedPlugins, setSelectedPlugins ] = useState< string[] >( initSelectedPlugins );
	const [ fieldTouched, setFieldTouched ] = useState( false );

	const removeUnlistedSelectedPlugins = useCallback( () => {
		if ( isPluginsFetched ) {
			setSelectedPlugins(
				selectedPlugins.filter( ( plugin ) => plugins.find( ( p ) => p.plugin === plugin ) )
			);
		}
	}, [ plugins, isPluginsFetched ] );
	const onPluginSelectionChange = useCallback(
		( plugin: CorePlugin, isChecked: boolean ) => {
			if ( isChecked ) {
				const _plugins: string[] = [ ...selectedPlugins ];
				_plugins.push( plugin.plugin );
				setSelectedPlugins( _plugins );
			} else {
				setSelectedPlugins( selectedPlugins.filter( ( name ) => name !== plugin.plugin ) );
			}
		},
		[ selectedPlugins ]
	);

	const onPluginSelectAllChange = useCallback(
		( isChecked: boolean ) => {
			isChecked
				? setSelectedPlugins( plugins.map( ( plugin ) => plugin.plugin ) ?? [] )
				: setSelectedPlugins( [] );
		},
		[ plugins ]
	);

	const isPluginSelectionDisabled = useCallback(
		( plugin: CorePlugin ) => {
			return (
				selectedPlugins.length >= MAX_SELECTABLE_PLUGINS &&
				! selectedPlugins.includes( plugin.plugin )
			);
		},
		[ selectedPlugins ]
	);

	useEffect( () => onTouch?.( fieldTouched ), [ fieldTouched ] );
	useEffect( () => onChange?.( selectedPlugins ), [ selectedPlugins ] );
	useEffect( () => removeUnlistedSelectedPlugins(), [ plugins, isPluginsFetched ] );

	return (
		<div className="form-field form-field--plugins">
			<label htmlFor="plugins">{ translate( 'Select plugins' ) }</label>
			{ pluginsAvailable && (
				<span className="plugin-select-stats">
					{ selectedPlugins.length }/
					{ plugins.length < MAX_SELECTABLE_PLUGINS ? plugins.length : MAX_SELECTABLE_PLUGINS }
				</span>
			) }

			{ pluginsAvailable && (
				<Text className="info-msg">
					{ translate( 'Plugins not listed below are automatically updated by WordPress.com.' ) }
				</Text>
			) }

			<div className={ clsx( { 'form-control-container': borderWrapper } ) }>
				{ pluginsAvailable && (
					<>
						<SearchControl
							id="plugins"
							onChange={ setPluginSearchTerm }
							value={ pluginSearchTerm }
							placeholder={ translate( 'Search plugins' ) }
						/>
						<div className="checkbox-options-container">
							{ isPluginsFetching && <Spinner /> }
							{ isPluginsFetched &&
								plugins.length !== 0 &&
								plugins.length <= MAX_SELECTABLE_PLUGINS && (
									<CheckboxControl
										label={ translate( 'Select all' ) }
										indeterminate={
											selectedPlugins.length > 0 && selectedPlugins.length < plugins.length
										}
										checked={ selectedPlugins.length === plugins.length }
										onChange={ onPluginSelectAllChange }
									/>
								) }
							{ isPluginsFetched &&
								plugins.map( ( plugin ) => (
									<Fragment key={ plugin.plugin }>
										{ plugin.name.toLowerCase().includes( pluginSearchTerm.toLowerCase() ) && (
											<CheckboxControl
												key={ plugin.plugin }
												label={ plugin.name }
												checked={ selectedPlugins.includes( plugin.plugin ) }
												disabled={ isPluginSelectionDisabled( plugin ) }
												className={ clsx( {
													disabled: isPluginSelectionDisabled( plugin ),
												} ) }
												onChange={ ( isChecked ) => {
													onPluginSelectionChange( plugin, isChecked );
													setFieldTouched( true );
												} }
											/>
										) }
									</Fragment>
								) ) }
						</div>
					</>
				) }
				{ ! pluginsAvailable && selectedSites && selectedSites.length === 0 && (
					<p className="placeholder-info">
						{ translate( 'Please select a site to view available plugins.' ) }
					</p>
				) }
				{ ! pluginsAvailable && selectedSites && selectedSites.length > 0 && (
					<p className="placeholder-info">{ translate( 'No plugins to update.' ) }</p>
				) }
			</div>
			{ ( () => {
				if ( ( showError && error ) || ( fieldTouched && error ) ) {
					return (
						<Text className="validation-msg">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							{ error }
						</Text>
					);
				} else if ( isPluginsFetched && plugins.length === 0 ) {
					return (
						<Text className="validation-msg">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							{ translate(
								'All installed plugins are provided by WordPress.com and automatically updated for you. Add a plugin from the WordPress.com Marketplace to create a schedule!'
							) }
						</Text>
					);
				}
			} )() }
		</div>
	);
}
