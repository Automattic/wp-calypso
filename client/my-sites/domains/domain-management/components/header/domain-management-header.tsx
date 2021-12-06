import { SVG, Circle } from '@wordpress/components';
import { Icon, home, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import FormattedHeader from 'calypso/components/formatted-header';
import { isMappedDomain } from 'calypso/lib/domains';
import { type as DomainType, transferStatus } from 'calypso/lib/domains/constants';
import { isRecentlyRegistered } from 'calypso/lib/domains/utils/is-recently-registered';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import { domainManagementList, isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isPrimaryDomainBySiteId from 'calypso/state/selectors/is-primary-domain-by-site-id';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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

	const renderCircle = () => (
		<SVG viewBox="0 0 24 24">
			<Circle cx="12" cy="12" r="12" />
		</SVG>
	);

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

	const renderSuccessBadge = ( description: TranslateResult, icon?: JSX.Element ) => (
		<Badge className="domain-management-header__badge domain-management-header__badge--success">
			{ icon ? (
				<Icon icon={ icon } size={ 14 } />
			) : (
				<div className="domain-management-header__badge-indicator">{ renderCircle() }</div>
			) }
			{ description }
		</Badge>
	);

	const renderWarningBadge = ( description: TranslateResult ) => (
		<Badge className="domain-management-header__badge domain-management-header__badge--success">
			<div className="domain-management-header__badge-indicator">{ renderCircle() }</div>
			{ description }
		</Badge>
	);

	const renderPremiumBadge = () => (
		<Badge className="domain-management-header__badge domain-management-header__badge--premium">
			{ __( 'Premium domain' ) }
			<Icon icon={ info } size={ 14 } />
		</Badge>
	);

	const renderNeutralBadge = ( description: TranslateResult ) => (
		<Badge className="domain-management-header__badge domain-management-header__badge--neutral">
			{ description }
		</Badge>
	);

	const renderTransferOrMappingBadge = ( type: string ) => {
		if ( type === DomainType.MAPPED ) {
			return renderNeutralBadge( __( 'Registered with an external provider' ) );
		}

		return renderNeutralBadge( __( 'Domain transfer' ) );
	};

	const renderStatusBadge = () => {
		if ( domain.expired ) {
			return renderWarningBadge( __( 'Expired' ) );
		}

		if ( domain.isPendingIcannVerification ) {
			return renderWarningBadge( __( 'Verify email' ) );
		}

		if ( isRecentlyRegistered( domain.registrationDate ) ) {
			return renderSuccessBadge( __( 'Activating' ) );
		}

		if ( domain.transferStatus === transferStatus.PENDING_REGISTRY ) {
			return renderSuccessBadge( __( 'In progress' ) );
		}

		return renderSuccessBadge( __( 'Active' ) );
	};

	const renderBadges = () => {
		const { domain } = props;
		const badges = [];

		if ( [ DomainType.MAPPED, DomainType.TRANSFER ].includes( domain.type ) ) {
			badges.push( renderTransferOrMappingBadge( domain.type ) );
		}

		badges.push( renderStatusBadge() );

		if ( domain.isPrimary ) {
			badges.push( renderSuccessBadge( __( 'Primary site address' ), home ) );
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
			{ renderBadges() }
		</div>
	);
};

const connectComponent = connect( ( state, ownProps: DomainManagementHeaderPassedProps ) => {
	const path = getCurrentRoute( state );
	const siteId = getSelectedSiteId( state );
	const { domain } = ownProps;

	return {
		isManagingAllDomains: isUnderDomainManagementAll( path ),
		isMapping: domain && isMappedDomain( domain ),
		isPrimaryDomain: isPrimaryDomainBySiteId( state, siteId, domain.name ),
	};
} )( DomainManagementHeader );

export default connectComponent;
