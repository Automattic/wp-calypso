/** @format */

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
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { recordTracksEvent } from 'state/analytics/actions';
import { activateModule, deactivateModule } from 'state/jetpack/modules/actions';
import getCurrentRoute from 'state/selectors/get-current-route';
import { getCurrentUserId } from 'state/current-user/selectors';
import getJetpackModule from 'state/selectors/get-jetpack-module';
import isActivatingJetpackModule from 'state/selectors/is-activating-jetpack-module';
import isDeactivatingJetpackModule from 'state/selectors/is-deactivating-jetpack-module';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'state/sites/selectors';

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
		userID: PropTypes.number,
	};

	handleChange = () => {
		if ( ! this.props.checked ) {
			this._recordTracksEvent( 'calypso_jetpack_module_toggle_activated' );
			this.props.activateModule( this.props.siteId, this.props.moduleSlug );
		} else {
			this._recordTracksEvent( 'calypso_jetpack_module_toggle_deactivated' );
			this.props.deactivateModule( this.props.siteId, this.props.moduleSlug );
		}
	};

	_recordTracksEvent = name => {
		const tracksProps = {
			path: this.props.path,
			module: this.props.moduleSlug,
			userid: this.props.userID,
		};

		this.props.recordTracksEvent( name, tracksProps );
	};

	_getTracksProps = () => {
		return {
			path: this.props.path,
			module: this.props.moduleSlug,
			userID: this.props.userID,
		};
	};

	render() {
		if ( ! this.props.isJetpackSite ) {
			return null;
		}

		return (
			<span className="jetpack-module-toggle">
				<CompactFormToggle
					id={ `${ this.props.siteId }-${ this.props.moduleSlug }-toggle` }
					checked={ this.props.checked || false }
					toggling={ this.props.toggling }
					onChange={ this.handleChange }
					disabled={ this.props.disabled || this.props.toggleDisabled }
				>
					{ this.props.label }
				</CompactFormToggle>
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
			path: getCurrentRoute( state ),
			userID: getCurrentUserId( state ),
		};
	},
	{
		activateModule,
		deactivateModule,
		recordTracksEvent,
	}
)( localize( JetpackModuleToggle ) );
