/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import DomainPrimaryFlag from 'my-sites/domains/domain-management/components/domain/primary-flag';
import DomainTransferFlag from 'my-sites/domains/domain-management/components/domain/transfer-flag';
import PrimaryDomainButton from './primary-domain-button';
import SectionHeader from 'components/section-header';

class Header extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		settingPrimaryDomain: PropTypes.bool,
	};

	render() {
		const { domain } = this.props;

		if ( ! domain ) {
			return null;
		}

		const isJetpackSite = get( this.props, 'selectedSite.jetpack' );
		const isAtomicSite = get( this.props, 'selectedSite.options.is_automated_transfer' );

		const renderButton = this.props.selectedSite && ( ! isJetpackSite || isAtomicSite );

		return (
			<SectionHeader label={ domain.name }>
				<DomainPrimaryFlag domain={ domain } />
				<DomainTransferFlag domain={ domain } />

				{ renderButton && (
					<PrimaryDomainButton
						domain={ domain }
						selectedSite={ this.props.selectedSite }
						settingPrimaryDomain={ this.props.settingPrimaryDomain }
					/>
				) }
			</SectionHeader>
		);
	}
}

export default Header;
