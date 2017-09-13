/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { map, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormToggle from 'components/forms/form-toggle/compact';
import WrapSettingsForm from '../wrap-settings-form';

class PluginsTab extends Component {
	static propTypes = {
		fields: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {},
	};

	render() {
		const {
			fields: {
				plugin_list: plugins
			},
			handleAutosavingToggle,
			isRequesting,
			isSaving,
			translate,
		} = this.props;

		return (
			<div className="wp-super-cache__plugins-tab">
				<SectionHeader label={ translate( 'Plugins' ) } />
				<Card>
					{ map( plugins, ( { desc, enabled, key, title } ) => {
						return (
							<div key={ key }>
								<FormToggle
									checked={ !! enabled }
									disabled={ isRequesting || isSaving }
									onChange={ handleAutosavingToggle( 'plugin_list' ) /* FIXME */ }>
									<span>{ title }</span>
								</FormToggle>
								<FormSettingExplanation>
									{ desc }
								</FormSettingExplanation>
							</div>
						);
					} ) }
				</Card>
			</div>
		);
	}
}

const getFormSettings = settings => {
	return pick( settings, [
		'plugin_list'
	] );
};

export default WrapSettingsForm( getFormSettings )( PluginsTab );
