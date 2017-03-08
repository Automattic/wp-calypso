/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DomainPrimaryFlag from 'my-sites/upgrades/domain-management/components/domain/primary-flag';
import PrimaryDomainButton from './primary-domain-button';
import SectionHeader from 'components/section-header';

const Header = React.createClass( {
	propTypes: {
		domain: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		settingPrimaryDomain: React.PropTypes.bool.isRequired
	},

	render() {
		const { domain } = this.props;

		if ( ! domain ) {
			return null;
		}

		return (
			<SectionHeader label={ domain.name }>
				<DomainPrimaryFlag domain={ domain } />

				{ this.props.selectedSite && ! this.props.selectedSite.jetpack &&
				<PrimaryDomainButton
					domain={ domain }
					selectedSite={ this.props.selectedSite }
					settingPrimaryDomain={ this.props.settingPrimaryDomain } /> }
			</SectionHeader>
		);
	}
} );

export default Header;
