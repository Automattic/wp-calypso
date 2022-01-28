import { Circle, SVG } from '@wordpress/components';
import { home, Icon, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import Badge from 'calypso/components/badge';
import FormattedHeader from 'calypso/components/formatted-header';
import { resolveDomainStatus } from 'calypso/lib/domains';
import { type as DomainType } from 'calypso/lib/domains/constants';
import TransferConnectedDomainNudge from 'calypso/my-sites/domains/domain-management/components/transfer-connected-domain-nudge';
import type { SettingsHeaderProps } from './types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

const SettingsHeader = ( props: SettingsHeaderProps ): JSX.Element => {
	const { __ } = useI18n();
	let badgeCounter = 0;

	const renderCircle = () => (
		<SVG viewBox="0 0 24 24" height={ 8 } width={ 8 }>
			<Circle cx="12" cy="12" r="12" />
		</SVG>
	);

	const renderSuccessBadge = ( description: TranslateResult, icon?: JSX.Element ) => (
		<Badge
			className="settings-header__badge settings-header__badge--success"
			key={ `badge${ badgeCounter++ }` }
		>
			{ icon ? (
				<Icon icon={ icon } size={ 14 } />
			) : (
				<div className="settings-header__badge-indicator">{ renderCircle() }</div>
			) }
			{ description }
		</Badge>
	);

	const renderWarningBadge = ( description: TranslateResult ) => (
		<Badge
			className="settings-header__badge settings-header__badge--warning"
			key={ `badge${ badgeCounter++ }` }
		>
			<div className="settings-header__badge-indicator">{ renderCircle() }</div>
			{ description }
		</Badge>
	);

	const renderPremiumBadge = () => (
		<Badge
			className="settings-header__badge settings-header__badge--premium"
			key={ `badge${ badgeCounter++ }` }
		>
			{ __( 'Premium domain' ) }
			<Icon icon={ info } size={ 17 } />
		</Badge>
	);

	const renderNeutralBadge = ( description: TranslateResult ) => (
		<Badge
			className="settings-header__badge settings-header__badge--neutral"
			key={ `badge${ badgeCounter++ }` }
		>
			{ description }
		</Badge>
	);

	const renderDomainTypeBadge = ( type: string ) => {
		if ( type === DomainType.SITE_REDIRECT ) {
			return renderNeutralBadge( __( 'Site Redirect' ) );
		}

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

		if (
			[ DomainType.SITE_REDIRECT, DomainType.MAPPED, DomainType.TRANSFER ].includes( domain.type )
		) {
			badges.push( renderDomainTypeBadge( domain.type ) );
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

	const renderNotices = () => {
		const { domain, site } = props;
		const { noticeText, statusClass } = resolveDomainStatus( domain, null, {
			siteSlug: site?.slug,
			getMappingErrors: true,
		} );

		if ( noticeText && statusClass )
			return (
				<div className="settings-header__domain-notice">
					<Icon
						icon={ info }
						size={ 18 }
						className={ classnames( 'settings-header__domain-notice-icon gridicon', {
							'gridicon--error settings-header__domain-notice-icon--rotated': [
								'status-error',
								'status-warning',
								'status-alert',
							].includes( statusClass ),
						} ) }
						viewBox="2 2 20 20"
					/>
					<div className="settings-header__domain-notice-message">{ noticeText }</div>
				</div>
			);

		return null;
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
			{ renderNotices() }
			<TransferConnectedDomainNudge
				domain={ props.domain }
				location="domain_settings"
				siteSlug={ props.site.slug }
			/>
		</div>
	);
};

export default SettingsHeader;
