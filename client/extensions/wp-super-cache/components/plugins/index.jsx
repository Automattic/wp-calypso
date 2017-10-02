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
		// Connected props
		isRequesting: PropTypes.bool,
		plugins: PropTypes.object,
		siteId: PropTypes.number,
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
			isRequesting,
			plugins,
			siteId,
			translate,
		} = this.props;

		return (
			<div className="wp-super-cache__plugins-tab">
				<QueryPlugins siteId={ siteId } />

				<Card>
					<p>{ translate(
						'Cache plugins are PHP scripts that live in a plugins folder inside the wp-super-cache folder. ' +
						'They are loaded when Supercache loads, much sooner than regular WordPress plugins.'
					) }</p>
					<p>{ translate(
						'This is strictly an advanced feature only and knowledge of both PHP and WordPress actions ' +
						'is required to create them.'
					) }</p>
					<p>{ translate(
						'{{strong}}Warning!{{/strong}} Due to the way WordPress upgrades plugins, the plugins you upload to ' +
						'wp-super-cache/plugins/ will be deleted when you upgrade WP Super Cache. ' +
						'You can avoid this by loading the plugins from elsewhere. ' +
						'Set {{strong}}$wp_cache_plugins_dir{{/strong}} to the new location in wp-config.php and WP Super Cache ' +
						'will look there instead. More info available in the {{a}}developer documentation.{{/a}}',
						{ components: {
							a: <ExternalLink href="https://odd.blog/wp-super-cache-developers/" target="_blank" />,
							strong: <strong />,
						} }
					) }</p>
				</Card>

				<SectionHeader label={ translate( 'Plugins' ) } />
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
									{ url && <ExternalLink href={ url } target="_blank">
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
