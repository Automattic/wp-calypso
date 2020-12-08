/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import FormToggle from 'calypso/components/forms/form-toggle';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { activateModule, deactivateModule } from 'calypso/state/jetpack/modules/actions';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import getJetpackModule from 'calypso/state/selectors/get-jetpack-module';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isDeactivatingJetpackModule from 'calypso/state/selectors/is-deactivating-jetpack-module';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';

class JetpackModuleToggle extends Component {
	static defaultProps = {
		disabled: false,
		toggleDisabled: false,
		checked: false,
		isJetpackSite: false,
	};

	static propTypes = {
		siteId: PropTypes.number,
		moduleSlug: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		checked: PropTypes.bool,
		disabled: PropTypes.bool,
		toggleDisabled: PropTypes.bool,
		isJetpackSite: PropTypes.bool,
		activateModule: PropTypes.func,
		deactivateModule: PropTypes.func,
		path: PropTypes.string,
	};

	handleChange = () => {
		if ( ! this.props.checked ) {
			this.recordTracksEvent( 'calypso_jetpack_module_toggle', 'on' );
			this.props.activateModule( this.props.siteId, this.props.moduleSlug );
		} else {
			this.recordTracksEvent( 'calypso_jetpack_module_toggle', 'off' );
			this.props.deactivateModule( this.props.siteId, this.props.moduleSlug );
		}
	};

	recordTracksEvent = ( name, status ) => {
		const tracksProps = {
			module: this.props.moduleSlug,
			path: this.props.path,
			toggled: status,
		};

		this.props.recordTracksEvent( name, tracksProps );
	};

	render() {
		if ( ! this.props.isJetpackSite ) {
			return null;
		}

		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<span className="jetpack-module-toggle">
				<FormToggle
					id={ `${ this.props.siteId }-${ this.props.moduleSlug }-toggle` }
					checked={ this.props.checked || false }
					onChange={ this.handleChange }
					disabled={ this.props.disabled || this.props.toggleDisabled || this.props.toggling }
				>
					{ this.props.label }
				</FormToggle>
				{ this.props.description && (
					<FormSettingExplanation isIndented>{ this.props.description }</FormSettingExplanation>
				) }
			</span>
		);
	}
}

export default connect(
	( state, { moduleSlug, siteId } ) => {
		const active = isJetpackModuleActive( state, siteId, moduleSlug );
		const activating = isActivatingJetpackModule( state, siteId, moduleSlug );
		const moduleDetails = getJetpackModule( state, siteId, moduleSlug );
		const deactivating = isDeactivatingJetpackModule( state, siteId, moduleSlug );
		const moduleDetailsNotLoaded = moduleDetails === null;
		const toggling = activating || deactivating;
		return {
			moduleDetails,
			checked: ( active && ! deactivating ) || ( ! active && activating ),
			toggling,
			toggleDisabled: moduleDetailsNotLoaded || toggling,
			isJetpackSite: isJetpackSite( state, siteId ),
			path: getCurrentRouteParameterized( state, siteId ),
		};
	},
	{
		activateModule,
		deactivateModule,
		recordTracksEvent,
	}
)( localize( JetpackModuleToggle ) );
