import {
	__experimentalText as Text,
	CheckboxControl,
	SearchControl,
	Spinner,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
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
	} = props;
	const translate = useTranslate();
	const plugins = useMemo( () => props.plugins || [], [ props.plugins ] );
	const pluginsAvailable = props.plugins !== undefined || isPluginsFetching;

	const [ pluginSearchTerm, setPluginSearchTerm ] = useState( '' );
	const [ selectedPlugins, setSelectedPlugins ] = useState< string[] >( initSelectedPlugins );
	const [ fieldTouched, setFieldTouched ] = useState( false );

	const removeUnlistedSelectedPlugins = useCallback( () => {
		setSelectedPlugins(
			selectedPlugins.filter( ( plugin ) => plugins.find( ( p ) => p.plugin === plugin ) )
		);
	}, [ plugins, selectedPlugins ] );

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
	useEffect( () => removeUnlistedSelectedPlugins(), [ plugins ] );

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

			<div className={ classnames( { 'form-control-container': borderWrapper } ) }>
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
												className={ classnames( {
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
				{ ! pluginsAvailable && (
					<p className="placeholder-info">
						{ translate( 'Please select a site to view available plugins.' ) }
					</p>
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
								'The current site selection does not have any plugins that can be scheduled for updates.'
							) }
						</Text>
					);
				}
			} )() }
		</div>
	);
}
