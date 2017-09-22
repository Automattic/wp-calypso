/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import PrimaryDomainButton from './primary-domain-button';
import SectionHeader from 'components/section-header';
import DomainPrimaryFlag from 'my-sites/domains/domain-management/components/domain/primary-flag';

const Header = React.createClass( {
	propTypes: {
		domain: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired,
		settingPrimaryDomain: PropTypes.bool.isRequired
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
