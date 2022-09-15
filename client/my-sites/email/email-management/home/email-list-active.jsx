import { CompactCard } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import MaterialIcon from 'calypso/components/material-icon';
import SectionHeader from 'calypso/components/section-header';
import { useGetEmailAccountsQuery } from 'calypso/data/emails/use-get-email-accounts-query';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import {
	getNumberOfMailboxesText,
	resolveEmailPlanStatus,
} from 'calypso/my-sites/email/email-management/home/utils';
import { emailManagement } from 'calypso/my-sites/email/paths';

const EmailListActiveWarning = ( { domain, selectedSiteId } ) => {
	const { data: emailAccounts = [], isLoading } = useGetEmailAccountsQuery(
		selectedSiteId,
		domain.name,
		{ retry: false }
	);

	const { icon, statusClass, text } = resolveEmailPlanStatus(
		domain,
		emailAccounts[ 0 ],
		isLoading
	);

	if ( statusClass !== 'error' ) {
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

class EmailListActive extends Component {
	render() {
		const { currentRoute, domains, selectedSiteSlug, translate, selectedSiteId, source } =
			this.props;

		if ( domains.length < 1 ) {
			return null;
		}

		const emailListItems = domains.map( ( domain ) => {
			return (
				<CompactCard
					href={ emailManagement( selectedSiteSlug, domain.name, currentRoute, { source } ) }
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
	source: PropTypes.string,

	// Props injected via connect()
	translate: PropTypes.func.isRequired,
};

export default localize( EmailListActive );
