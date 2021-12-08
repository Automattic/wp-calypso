import { Circle, SVG } from '@wordpress/components';
import { home, Icon, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import FormattedHeader from 'calypso/components/formatted-header';
import { isMappedDomain, resolveDomainStatus } from 'calypso/lib/domains';
import { type as DomainType } from 'calypso/lib/domains/constants';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import {
	domainManagementEdit,
	domainManagementList,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type {
	SettingsHeaderProps,
	SettingsHeaderConnectedProps,
	SettingsHeaderPassedProps,
} from './types';
import type { TranslateResult } from 'i18n-calypso';
import './style.scss';

const SettingsHeader = ( props: SettingsHeaderProps ) => {
	const { selectedDomainName, isManagingAllDomains } = props;
	const { __ } = useI18n();
	let formattedHeaderText = selectedDomainName;
	if ( ! selectedDomainName ) {
		formattedHeaderText = isManagingAllDomains ? __( 'All Domains' ) : __( 'Site Domains' );
	}

	const renderBreadcrumbs = () => {
		const { selectedSite, currentRoute, selectedDomainName } = props;

		const previousPath = domainManagementEdit(
			selectedSite.slug,
			selectedDomainName,
			currentRoute
		);

		const items = [
			{
				label: __( 'Domains' ),
				href: domainManagementList( selectedSite?.slug, selectedDomainName ),
			},
			{ label: selectedDomainName },
		];

		const mobileItem = {
			label: __( 'Back' ),
			href: previousPath,
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	const renderCircle = () => (
		<SVG viewBox="0 0 24 24">
			<Circle cx="12" cy="12" r="12" />
		</SVG>
	);

	const renderSuccessBadge = ( description: TranslateResult, icon?: JSX.Element ) => (
		<Badge className="settings-header__badge settings-header__badge--success">
			{ icon ? (
				<Icon icon={ icon } size={ 14 } />
			) : (
				<div className="settings-header__badge-indicator">{ renderCircle() }</div>
			) }
			{ description }
		</Badge>
	);

	const renderWarningBadge = ( description: TranslateResult ) => (
		<Badge className="settings-header__badge settings-header__badge--warning">
			<div className="settings-header__badge-indicator">{ renderCircle() }</div>
			{ description }
		</Badge>
	);

	const renderPremiumBadge = () => (
		<Badge className="settings-header__badge settings-header__badge--premium">
			{ __( 'Premium domain' ) }
			<Icon icon={ info } size={ 17 } />
		</Badge>
	);

	const renderNeutralBadge = ( description: TranslateResult ) => (
		<Badge className="settings-header__badge settings-header__badge--neutral">
			{ description }
		</Badge>
	);

	const renderTransferOrMappingBadge = ( type: string ) => {
		if ( type === DomainType.MAPPED ) {
			return renderNeutralBadge( __( 'Registered with an external provider' ) );
		}

		return renderNeutralBadge( __( 'Domain Transfer' ) );
	};

	const renderStatusBadge = ( domain: typeof props[ 'domain' ] ) => {
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

		return <div className="settings-header__container-badges">{ badges }</div>;
	};

	return (
		<div className="settings-header__container">
			{ renderBreadcrumbs() }
			<div className="settings-header__container-title">
				<FormattedHeader
					brandFont
					className="settings-header__title"
					headerText={ formattedHeaderText }
					align="left"
					hasScreenOptions={ false }
				/>
				{ renderBadges() }
			</div>
		</div>
	);
};

export default connect< SettingsHeaderConnectedProps, never, SettingsHeaderPassedProps >(
	( state, ownProps: SettingsHeaderPassedProps ): SettingsHeaderConnectedProps => {
		const path = getCurrentRoute( state );
		const { domain } = ownProps;

		return {
			selectedSite: getSelectedSite( state )!,
			selectedDomainName: domain.name,
			currentRoute: getCurrentRoute( state ),
			isManagingAllDomains: Boolean( isUnderDomainManagementAll( path ) ),
			isMapping: domain && isMappedDomain( domain ),
		};
	}
)( SettingsHeader );
