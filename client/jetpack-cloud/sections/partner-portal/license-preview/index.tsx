import { isEnabled } from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { Badge, Button, Gridicon } from '@automattic/components';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useEffect, useState } from 'react';
import FormattedDate from 'calypso/components/formatted-date';
import getLicenseState from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-license-state';
import LicenseDetails from 'calypso/jetpack-cloud/sections/partner-portal/license-details';
import LicenseListItem from 'calypso/jetpack-cloud/sections/partner-portal/license-list-item';
import {
	LicenseState,
	LicenseFilter,
	LicenseType,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { infoNotice, errorNotice } from 'calypso/state/notices/actions';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import LicenseActions from './license-actions';

import './style.scss';

interface Props {
	licenseKey: string;
	product: string;
	username: string | null;
	blogId: number | null;
	siteUrl: string | null;
	hasDownloads: boolean;
	issuedAt: string;
	attachedAt: string | null;
	revokedAt: string | null;
	filter: LicenseFilter;
	licenseType: LicenseType;
}

export default function LicensePreview( {
	licenseKey,
	product,
	username,
	blogId,
	siteUrl,
	hasDownloads,
	issuedAt,
	attachedAt,
	revokedAt,
	filter,
	licenseType,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isHighlighted = getQueryArg( window.location.href, 'highlight' ) === licenseKey;
	const [ isOpen, setOpen ] = useState( isHighlighted );
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );
	const licenseState = getLicenseState( attachedAt, revokedAt );
	const domain = siteUrl ? getUrlParts( siteUrl ).hostname || siteUrl : '';

	const site = useSelector( ( state ) => getSite( state, blogId as number ) );

	const open = useCallback( () => {
		setOpen( ! isOpen );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_list_preview_toggle' ) );
	}, [ dispatch, isOpen ] );

	const onCopyLicense = useCallback( () => {
		dispatch( infoNotice( translate( 'License copied!' ), { duration: 2000 } ) );
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_list_copy_license_click' ) );
	}, [ dispatch, translate ] );

	const assign = useCallback( () => {
		const redirectUrl = addQueryArgs( { key: licenseKey }, '/partner-portal/assign-license' );
		if ( paymentMethodRequired ) {
			const noticeLinkHref = addQueryArgs(
				{
					return: redirectUrl,
				},
				'/partner-portal/payment-methods/add'
			);
			const errorMessage = translate(
				'A primary payment method is required.{{br/}} ' +
					'{{a}}Try adding a new payment method{{/a}} or contact support.',
				{
					components: {
						a: <a href={ noticeLinkHref } />,
						br: <br />,
					},
				}
			);

			dispatch( errorNotice( errorMessage ) );
			return;
		}

		page.redirect( redirectUrl );
	}, [ paymentMethodRequired, translate, dispatch, errorNotice, licenseKey ] );

	useEffect( () => {
		if ( isHighlighted ) {
			page.redirect(
				removeQueryArgs( window.location.pathname + window.location.search, 'highlight' )
			);
		}
	}, [] );

	const isSiteAtomic =
		isEnabled( 'jetpack/pro-dashboard-wpcom-atomic-hosting' ) && site?.is_wpcom_atomic;

	return (
		<div
			className={ classnames( {
				'license-preview': true,
				'license-preview--is-open': isOpen,
			} ) }
		>
			<LicenseListItem
				className={ classnames( {
					'license-preview__card': true,
					'license-preview__card--is-detached': licenseState === LicenseState.Detached,
					'license-preview__card--is-revoked': licenseState === LicenseState.Revoked,
				} ) }
			>
				<div>
					<span className="license-preview__product">{ product }</span>
				</div>

				<div>
					<div className="license-preview__product-small">{ product }</div>
					{ domain }
					{ ! domain && licenseState === LicenseState.Detached && (
						<span>
							<Badge type="warning">{ translate( 'Unassigned' ) }</Badge>
							{ licenseType === LicenseType.Partner && (
								<Button
									className="license-preview__assign-button"
									borderless
									compact
									onClick={ assign }
								>
									{ translate( 'Assign' ) }
								</Button>
							) }
						</span>
					) }
					{ revokedAt && (
						<span>
							<Badge type="error">{ translate( 'Revoked' ) }</Badge>
						</span>
					) }
				</div>

				<div>
					<div className="license-preview__label">{ translate( 'Issued on:' ) }</div>

					<FormattedDate date={ issuedAt } format="YYYY-MM-DD" />
				</div>

				{ filter !== LicenseFilter.Revoked ? (
					<div>
						<div className="license-preview__label">{ translate( 'Assigned on:' ) }</div>

						{ licenseState === LicenseState.Attached && (
							<FormattedDate date={ attachedAt } format="YYYY-MM-DD" />
						) }

						{ licenseState !== LicenseState.Attached && (
							<Gridicon icon="minus" className="license-preview__no-value" />
						) }
					</div>
				) : (
					<div>
						<div className="license-preview__label">{ translate( 'Revoked on:' ) }</div>

						{ licenseState === LicenseState.Revoked && (
							<FormattedDate date={ revokedAt } format="YYYY-MM-DD" />
						) }

						{ licenseState !== LicenseState.Revoked && (
							<Gridicon icon="minus" className="license-preview__no-value" />
						) }
					</div>
				) }

				<div>
					{ LicenseType.Standard === licenseType && (
						<Badge type="success">{ translate( 'Standard license' ) }</Badge>
					) }
				</div>

				<div>
					{ isSiteAtomic ? (
						<LicenseActions
							siteUrl={ siteUrl }
							licenseKey={ licenseKey }
							product={ product }
							attachedAt={ attachedAt }
							revokedAt={ revokedAt }
							licenseType={ licenseType }
						/>
					) : (
						<Button onClick={ open } className="license-preview__toggle" borderless>
							<Gridicon icon={ isOpen ? 'chevron-up' : 'chevron-down' } />
						</Button>
					) }
				</div>
			</LicenseListItem>

			{ isOpen && (
				<LicenseDetails
					licenseKey={ licenseKey }
					product={ product }
					siteUrl={ siteUrl }
					username={ username }
					blogId={ blogId }
					hasDownloads={ hasDownloads }
					issuedAt={ issuedAt }
					attachedAt={ attachedAt }
					revokedAt={ revokedAt }
					onCopyLicense={ onCopyLicense }
					licenseType={ licenseType }
				/>
			) }
		</div>
	);
}

export function LicensePreviewPlaceholder() {
	const translate = useTranslate();

	return (
		<div className="license-preview license-preview--placeholder">
			<LicenseListItem className="license-preview__card">
				<div>
					<h3 className="license-preview__domain">{ translate( 'Loading' ) }</h3>

					<div className="license-preview__product" />
				</div>

				<div>
					<div className="license-preview__label">{ translate( 'Issued on:' ) }</div>

					<div />
				</div>

				<div>
					<div className="license-preview__label">{ translate( 'Assigned on:' ) }</div>

					<div />
				</div>

				<div>
					<div className="license-preview__label">{ translate( 'Revoked on:' ) }</div>

					<div />
				</div>

				<div>
					<div className="license-preview__copy-license-key" />
				</div>

				<div />
			</LicenseListItem>
		</div>
	);
}
