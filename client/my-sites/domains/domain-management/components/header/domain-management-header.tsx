import { Circle, SVG } from '@wordpress/components';
import { home, Icon, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import FormattedHeader from 'calypso/components/formatted-header';
import { isMappedDomain, resolveDomainStatus } from 'calypso/lib/domains';
import { type as DomainType } from 'calypso/lib/domains/constants';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import { domainManagementList, isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isPrimaryDomainBySiteId from 'calypso/state/selectors/is-primary-domain-by-site-id';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { DomainManagementHeaderPassedProps, DomainManagementHeaderProps } from './types';
import type { TranslateResult } from 'i18n-calypso';
import './style.scss';

const DomainManagementHeader = ( props: DomainManagementHeaderProps ) => {
	const { selectedDomainName, isManagingAllDomains, selectedSite } = props;
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

	const renderStatusBadge = ( domain: typeof props[ 'domain' ] ) => {
		if ( domain.isPendingIcannVerification ) {
			return renderWarningBadge( __( 'Verify email' ) );
		}

		const { status, statusClass } = resolveDomainStatus( domain );

		if ( status ) {
			return statusClass === 'status-success'
				? renderSuccessBadge( status )
				: renderWarningBadge( status );
		}
	};

	const renderBadges = () => {
		const { domain } = props;
		const badges = [];

		if ( [ DomainType.MAPPED, DomainType.TRANSFER ].includes( domain.type ) ) {
			badges.push( renderTransferOrMappingBadge( domain.type ) );
		}

		const statusBadge = renderStatusBadge( domain );
		if ( statusBadge ) {
			badges.push( statusBadge );
		}

		if ( domain.isPrimary ) {
			badges.push( renderSuccessBadge( __( 'Primary site address' ), home ) );
		}

		if ( domain.isPremium ) {
			badges.push( renderPremiumBadge() );
		}

		return <div className="domain-management-header__container-badges">{ badges }</div>;
	};

	return (
		<div className="domain-management-header__container">
			{ renderBreadcrumbs() }
			<div className="domain-management-header__container-title">
				<FormattedHeader
					brandFont
					className="domain-management-header__title"
					headerText={ formattedHeaderText }
					align="left"
					hasScreenOptions={ false }
				/>
				{ renderBadges() }
			</div>
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
