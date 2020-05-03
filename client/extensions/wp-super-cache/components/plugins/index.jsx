/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { flowRight, map, mapValues, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ExternalLink from 'components/external-link';
import SectionHeader from 'components/section-header';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormToggle from 'components/forms/form-toggle/compact';
import WrapSettingsForm from '../wrap-settings-form';
import QueryPlugins from '../data/query-plugins';
import { getSelectedSiteId } from 'state/ui/selectors';
import { togglePlugin } from '../../state/plugins/actions';
import { isRequestingPlugins, isTogglingPlugin, getPlugins } from '../../state/plugins/selectors';

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
	};

	render() {
		const { isRequesting, plugins, siteId, translate } = this.props;

		return (
			<div className="wp-super-cache__plugins-tab">
				<QueryPlugins siteId={ siteId } />

				<Card>
					<p>
						{ translate(
							"Cache plugins are PHP scripts you'll find in a dedicated folder inside the WP Super Cache folder " +
								'(wp-super-cache/plugins/). They load at the same time as WP Super Cache, and before regular WordPress plugins.'
						) }
					</p>
					<p>
						{ translate(
							"Keep in mind that cache plugins are for advanced users only. To create and manage them, you'll need extensive " +
								'knowledge of both PHP and WordPress actions.'
						) }
					</p>
					<p>
						{ translate(
							'{{strong}}Warning!{{/strong}} Due to the way WordPress upgrades plugins, the ones you upload to the ' +
								'WP Super Cache folder (wp-super-cache/plugins/) will be deleted when you upgrade WP Super Cache. ' +
								'To avoid this loss, load your cache plugins from a different location. When you set ' +
								'{{strong}}$wp_cache_plugins_dir{{/strong}} to the new location in wp-config.php, WP Super Cache will ' +
								'look there instead. You can find additional details in the {{a}}developer documentation.{{/a}}',
							{
								components: {
									a: (
										<ExternalLink
											href="https://odd.blog/wp-super-cache-developers/"
											target="_blank"
										/>
									),
									strong: <strong />,
								},
							}
						) }
					</p>
				</Card>

				<SectionHeader label={ translate( 'Plugins' ) } />
				<Card>
					{ map( plugins, ( { desc, enabled, key, title, toggling, url } ) => {
						return (
							<div key={ key }>
								<FormToggle
									checked={ !! enabled }
									data-plugin={ key }
									disabled={ isRequesting || toggling }
									onChange={ this.togglePlugin( key, ! enabled ) }
								>
									<span>{ title }</span>
								</FormToggle>
								<FormSettingExplanation>
									{ desc + ' ' }
									{ url && (
										<ExternalLink href={ url } target="_blank">
											{ translate( 'Plugin Information' ) }
										</ExternalLink>
									) }
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
				toggling: isTogglingPlugin( state, siteId, plugin.key ),
			} ) ),
		};
	},
	{ togglePlugin }
);

const getFormSettings = ( settings ) => {
	return pick( settings, [ 'plugin_list' ] );
};

export default flowRight( connectComponent, WrapSettingsForm( getFormSettings ) )( PluginsTab );
