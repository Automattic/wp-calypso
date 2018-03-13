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
import { activateModule, deactivateModule } from 'state/jetpack/modules/actions';
import {
	getJetpackModule,
	isActivatingJetpackModule,
	isDeactivatingJetpackModule,
	isJetpackModuleActive,
} from 'state/selectors';
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
	};

	handleChange = () => {
		if ( ! this.props.checked ) {
			this.props.activateModule( this.props.siteId, this.props.moduleSlug );
		} else {
			this.props.deactivateModule( this.props.siteId, this.props.moduleSlug );
		}
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
		};
	},
	{
		activateModule,
		deactivateModule,
	}
)( localize( JetpackModuleToggle ) );
