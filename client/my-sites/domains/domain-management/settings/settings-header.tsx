import { Circle, SVG } from '@wordpress/components';
import { home, Icon, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import Badge from 'calypso/components/badge';
import FormattedHeader from 'calypso/components/formatted-header';
import { resolveDomainStatus } from 'calypso/lib/domains';
import { type as DomainType } from 'calypso/lib/domains/constants';
import type { SettingsHeaderProps } from './types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

const SettingsHeader = ( props: SettingsHeaderProps ): JSX.Element => {
	const { __ } = useI18n();

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
			<div className="settings-header__container-title">
				<FormattedHeader
					brandFont
					className="settings-header__title"
					headerText={ props.domain.name }
					align="left"
					hasScreenOptions={ false }
				/>
				{ renderBadges() }
			</div>
		</div>
	);
};

export default SettingsHeader;
