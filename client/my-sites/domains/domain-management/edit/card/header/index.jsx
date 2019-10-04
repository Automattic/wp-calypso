/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DomainPrimaryFlag from 'my-sites/domains/domain-management/components/domain/primary-flag';
import DomainTransferFlag from 'my-sites/domains/domain-management/components/domain/transfer-flag';
import PrimaryDomainButton from './primary-domain-button';
import SectionHeader from 'components/section-header';
import { type as domainTypes } from 'lib/domains/constants';
import { domainTransferIn as getDomainTransferPath } from 'my-sites/domains/paths';

class Header extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { domain, selectedSite } = this.props;

		if ( ! domain ) {
			return null;
		}

		const isJetpackSite = get( this.props, 'selectedSite.jetpack' );
		const isAtomicSite = get( this.props, 'selectedSite.options.is_automated_transfer' );

		const renderMakePrimaryButton = selectedSite && ( ! isJetpackSite || isAtomicSite );
		const renderTransferButton = renderMakePrimaryButton && domain.type === domainTypes.MAPPED;

		return (
			<SectionHeader label={ domain.name }>
				<DomainPrimaryFlag domain={ domain } />
				<DomainTransferFlag domain={ domain } />

				{ renderTransferButton && (
					<Button compact href={ getDomainTransferPath( selectedSite.slug, domain.name ) }>
						{ this.props.translate( 'Request Transfer', {
							comment: 'Request a transfer for a domain',
						} ) }
					</Button>
				) }
				{ renderMakePrimaryButton && (
					<PrimaryDomainButton domain={ domain } selectedSite={ selectedSite } />
				) }
			</SectionHeader>
		);
	}
}

export default localize( Header );
