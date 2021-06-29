/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';
import { localize } from 'i18n-calypso';
import { CompactCard } from '@automattic/components';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import SectionHeader from 'calypso/components/section-header';
import { emailManagement } from 'calypso/my-sites/email/paths';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import {
	getNumberOfMailboxesText,
	resolveEmailPlanStatus,
} from 'calypso/my-sites/email/email-management/home/utils';
import MaterialIcon from 'calypso/components/material-icon';
import { useEmailAccountsQuery } from 'calypso/data/emails/use-emails-query';

const EmailListActiveWarning = ( { domain, selectedSiteId } ) => {
	const { data, error, isLoading } = useEmailAccountsQuery( selectedSiteId, domain.name, {
		retry: false,
	} );
	let emailAccounts = null;

	if ( ! isLoading && ! error ) {
		emailAccounts = data?.accounts[ 0 ] ?? [];
	}
	const { icon, statusClass, text } = resolveEmailPlanStatus( domain, emailAccounts, isLoading );

	if ( statusClass === 'success' ) {
		return null;
	}

	return (
		<div className={ classnames( 'email-list-active__warning', statusClass ) }>
			<MaterialIcon icon={ icon } />

			<span>{ text }</span>
		</div>
	);
};

EmailListActiveWarning.propTypes = {
	domain: PropTypes.object.isRequired,
	selectedSiteId: PropTypes.number.isRequired,
};

class EmailListActive extends React.Component {
	render() {
		const { currentRoute, domains, selectedSiteSlug, translate, selectedSiteId } = this.props;

		if ( domains.length < 1 ) {
			return null;
		}

		const emailListItems = domains.map( ( domain ) => {
			return (
				<CompactCard
					href={ emailManagement( selectedSiteSlug, domain.name, currentRoute ) }
					key={ domain.name }
				>
					<span className="email-list-active__item-icon">
						<EmailTypeIcon domain={ domain } />
					</span>

					<div className="email-list-active__item-domain">
						<h2>{ domain.name }</h2>

						<span>{ getNumberOfMailboxesText( domain ) }</span>
					</div>

					<EmailListActiveWarning domain={ domain } selectedSiteId={ selectedSiteId } />
				</CompactCard>
			);
		} );

		return (
			<div className="email-list-active">
				<SectionHeader label={ translate( 'Domains with emails' ) } />

				{ emailListItems }
			</div>
		);
	}
}

EmailListActive.propTypes = {
	// Props passed to this component
	currentRoute: PropTypes.string.isRequired,
	domains: PropTypes.array.isRequired,
	selectedSiteSlug: PropTypes.string.isRequired,

	// Props injected via connect()
	translate: PropTypes.func.isRequired,
};

export default localize( EmailListActive );
