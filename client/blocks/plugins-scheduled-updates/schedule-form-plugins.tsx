import {
	__experimentalText as Text,
	CheckboxControl,
	SearchControl,
	Spinner,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { MAX_SELECTABLE_PLUGINS } from './config';
import type { CorePlugin } from 'calypso/data/plugins/types';

interface Props {
	plugins: CorePlugin[];
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
		plugins,
		selectedPlugins: initPlugins = [],
		isPluginsFetching,
		isPluginsFetched,
		error,
		showError,
		onChange,
		onTouch,
		borderWrapper = true,
	} = props;
	const translate = useTranslate();

	const [ pluginSearchTerm, setPluginSearchTerm ] = useState( '' );
	const [ selectedPlugins, setSelectedPlugins ] = useState< string[] >( initPlugins );
	const [ fieldTouched, setFieldTouched ] = useState( false );

	useEffect( () => onTouch?.( fieldTouched ), [ fieldTouched ] );
	useEffect( () => onChange?.( selectedPlugins ), [ selectedPlugins ] );

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

	return (
		<div className="form-field">
			<label htmlFor="plugins">{ translate( 'Select plugins' ) }</label>
			<span className="plugin-select-stats">
				{ selectedPlugins.length }/
				{ plugins.length < MAX_SELECTABLE_PLUGINS ? plugins.length : MAX_SELECTABLE_PLUGINS }
			</span>
			{ ( showError && error ) || ( fieldTouched && error ) ? (
				<Text className="validation-msg">
					<Icon className="icon-info" icon={ info } size={ 16 } />
					{ error }
				</Text>
			) : (
				<Text className="info-msg">
					{ translate( 'Plugins not listed below are automatically updated by WordPress.com.' ) }
				</Text>
			) }
			<div className={ classnames( { 'form-control-container': borderWrapper } ) }>
				<SearchControl
					id="plugins"
					onChange={ setPluginSearchTerm }
					value={ pluginSearchTerm }
					placeholder={ translate( 'Search plugins' ) }
				/>
				<div className="checkbox-options-container">
					{ isPluginsFetching && <Spinner /> }
					{ isPluginsFetched && plugins.length <= MAX_SELECTABLE_PLUGINS && (
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
			</div>
		</div>
	);
}
