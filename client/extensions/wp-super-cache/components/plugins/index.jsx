/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { flowRight, map, mapValues, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import SectionHeader from 'components/section-header';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormToggle from 'components/forms/form-toggle/compact';
import WrapSettingsForm from '../wrap-settings-form';
import QueryPlugins from '../data/query-plugins';
import { getSelectedSiteId } from 'state/ui/selectors';
import { togglePlugin } from '../../state/plugins/actions';
import { isRequestingPlugins, isTogglingPlugin, getPlugins } from '../../state/plugins/selectors';

class PluginsTab extends Component {
	static propTypes = {
		plugins: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {},
	};

	togglePlugin = ( plugin, newState ) => () => {
		this.props.togglePlugin( this.props.siteId, plugin, newState );
	}

	render() {
		const {
			plugins,
			isRequesting,
			siteId,
			translate,
		} = this.props;

		return (
			<div className="wp-super-cache__plugins-tab">
				<SectionHeader label={ translate( 'Plugins' ) } />
				<QueryPlugins siteId={ siteId } />
				<Card>
					{ map( plugins, ( { desc, enabled, key, title, toggling, url } ) => {
						return (
							<div key={ key }>
								<FormToggle
									checked={ !! enabled }
									data-plugin={ key }
									disabled={ isRequesting || toggling }
									onChange={ this.togglePlugin( key, ! enabled ) }>
									<span>{ title }</span>
								</FormToggle>
								<FormSettingExplanation>
									{ desc + ' ' }
									{ url && <ExternalLink href={ url } icon={ true } target="_blank">
										{ translate( 'Plugin Information' ) }
									</ExternalLink> }
								</FormSettingExplanation>
							</div>
						);
					} ) }
				</Card>
			</div>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const plugins = getPlugins( state, siteId );
		const isRequesting = isRequestingPlugins( state, siteId );

		return {
			isRequesting,
			plugins: mapValues( plugins, ( plugin ) => ( {
				...plugin,
				toggling: isTogglingPlugin( state, siteId, plugin.key )
			} ) )
		};
	},
	{ togglePlugin },
);

const getFormSettings = settings => {
	return pick( settings, [
		'plugin_list'
	] );
};

export default flowRight(
	connectComponent,
	WrapSettingsForm( getFormSettings )
)( PluginsTab );
