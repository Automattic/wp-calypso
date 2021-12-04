import { Icon, home } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import FormattedHeader from 'calypso/components/formatted-header';
import { isMappedDomain } from 'calypso/lib/domains';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import { domainManagementList, isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import './style.scss';
import type { DomainManagementHeaderPassedProps, DomainManagementHeaderProps } from './types';
import type { TranslateResult } from 'i18n-calypso';

const DomainManagementHeader = ( props: DomainManagementHeaderProps ) => {
	const { selectedDomainName, isManagingAllDomains, selectedSite, domain } = props;
	const { __ } = useI18n();
	let formattedHeaderText = selectedDomainName;
	if ( ! selectedDomainName ) {
		formattedHeaderText = isManagingAllDomains ? __( 'All Domains' ) : __( 'Site Domains' );
	}

	const renderBreadcrumbs = () => {
		const items = [
			{
				// translators: Internet domains, e.g. mygroovydomain.com
				label: __( 'Domains' ),
				href: domainManagementList( selectedSite!.slug, selectedDomainName ),
			},
			{
				label: selectedDomainName,
			},
		];

		const mobileItem = {
			label: __( 'Back to domains' ),
			href: domainManagementList( selectedSite!.slug, selectedDomainName ),
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	const renderMainBadge = () => null;

	const renderPrimaryBadge = () => (
		<Badge
			className="domain-management-header__badge domain-management-header__badge--primary"
			type="info-green"
		>
			<Icon icon={ home } size={ 14 } />
			{ __( 'Primary site address' ) }
		</Badge>
	);

	const renderPremiumBadge = () => (
		<Badge className="domain-management-header__badge domain-management-header__badge--premium">
			{ __( 'Premium domain' ) }
			<Icon icon={ home } size={ 14 } />
		</Badge>
	);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const renderNeutralBadge = ( description: TranslateResult ) => (
		<Badge className="domain-management-header__badge domain-management-header__badge--neutral">
			{ description }
		</Badge>
	);

	const renderBadges = ( domain: typeof props[ 'domain' ] ) => {
		const badges = [];

		const mainBadge = renderMainBadge();

		if ( mainBadge ) {
			badges.push( mainBadge );
		}

		if ( domain.isPrimary ) {
			badges.push( renderPrimaryBadge() );
		}

		if ( domain.isPremium ) {
			badges.push( renderPremiumBadge() );
		}

		return <div className="domain-management-header__badges-container">{ badges }</div>;
	};

	return (
		<div className="domain-management-header__container">
			{ renderBreadcrumbs() }
			<FormattedHeader
				brandFont
				className="domain-management-header__title"
				headerText={ formattedHeaderText }
				align="left"
				hasScreenOptions={ false }
			/>
			{ renderBadges( domain ) }
		</div>
	);
};

const connectComponent = connect( ( state, ownProps: DomainManagementHeaderPassedProps ) => {
	const path = getCurrentRoute( state );
	const { domain } = ownProps;

	return {
		isManagingAllDomains: isUnderDomainManagementAll( path ),
		isMapping: domain && isMappedDomain( domain ),
	};
} )( DomainManagementHeader );

export default connectComponent;
