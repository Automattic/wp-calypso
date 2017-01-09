/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

import {
	activateModule,
	deactivateModule
} from 'state/jetpack-settings/modules/actions';
import {
	isModuleActive,
	isActivatingModule,
	isDeactivatingModule,
	getModule
} from 'state/jetpack-settings/modules/selectors';
import { isJetpackSite } from 'state/sites/selectors';

class JetpackModuleToggle extends Component {
	static defaultProps = {
		disabled: false,
		toggleDisabled: false,
		checked: false,
		isJetpackSite: false
	};

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		moduleSlug: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		checked: PropTypes.bool,
		disabled: PropTypes.bool,
		toggleDisabled: PropTypes.bool,
		isJetpackSite: PropTypes.bool,
		activateModule: PropTypes.func,
		deactivateModule: PropTypes.func
	};

	handleChange = () => {
		if ( ! this.props.checked ) {
			this.props.activateModule( this.props.siteId, this.props.moduleSlug );
		} else {
			this.props.deactivateModule( this.props.siteId, this.props.moduleSlug );
		}
	}

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
					disabled={ this.props.disabled || this.props.toggleDisabled } >
					<span>{ this.props.label }</span>
					{
						this.props.description && (
							<FormSettingExplanation isIndented>
								{ this.props.description }
							</FormSettingExplanation>
						)
					}
				</CompactFormToggle>
			</span>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const active = isModuleActive( state, ownProps.siteId, ownProps.moduleSlug );
	const activating = isActivatingModule( state, ownProps.siteId, ownProps.moduleSlug );
	const moduleDetails = getModule( state, ownProps.siteId, ownProps.moduleSlug );
	const deactivating = isDeactivatingModule( state, ownProps.siteId, ownProps.moduleSlug );
	const moduleDetailsNotLoaded = moduleDetails === null;
	const toggling = activating || deactivating;
	return {
		moduleDetails,
		checked: ( active && ! deactivating ) || ( ! active && activating ),
		toggling,
		toggleDisabled: moduleDetailsNotLoaded || toggling,
		isJetpackSite: isJetpackSite( state, ownProps.siteId )
	};
}, {
	activateModule,
	deactivateModule
} )( localize( JetpackModuleToggle ) );
