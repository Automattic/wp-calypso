import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import { Badge, Button, Gridicon } from '@automattic/components';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useContext } from 'react';
import FormattedDate from 'calypso/components/formatted-date';
import getLicenseState from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-license-state';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import LicenseListItem from 'calypso/jetpack-cloud/sections/partner-portal/license-list-item';
import {
	LicenseState,
	LicenseFilter,
	LicenseType,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';

import './style.scss';

interface Props {
	licenseKey: string;
	product: string;
	blogId: number | null;
	siteUrl: string | null;
	hasDownloads: boolean;
	issuedAt: string;
	attachedAt: string | null;
	revokedAt: string | null;
	licenseType: LicenseType;
	parentLicenseId?: number | null;
	quantity?: number | null;
	isChildLicense?: boolean;
}

export default function LicensePreview( {
	licenseKey,
	product,
	siteUrl,
	issuedAt,
	attachedAt,
	revokedAt,
	licenseType,
	parentLicenseId,
	quantity,
	isChildLicense,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { filter } = useContext( LicenseListContext );

	const isHighlighted = getQueryArg( window.location.href, 'highlight' ) === licenseKey;

	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );
	const licenseState = getLicenseState( attachedAt, revokedAt );
	const domain = siteUrl ? getUrlParts( siteUrl ).hostname || siteUrl : '';

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
	}, [ paymentMethodRequired, translate, dispatch, licenseKey ] );

	useEffect( () => {
		if ( isHighlighted ) {
			page.redirect(
				removeQueryArgs( window.location.pathname + window.location.search, 'highlight' )
			);
		}
	}, [] );

	const isParentLicense = quantity && parentLicenseId;

	const bundleCountContent = quantity && (
		<Badge className="license-preview__license-count" type="info">
			{ translate( '%(quantity)d License Bundle', {
				context: 'bundle license count',
				args: {
					quantity,
				},
			} ) }
		</Badge>
	);

	return (
		<div
			className={ classnames( {
				'license-preview': true,
			} ) }
		>
			<LicenseListItem
				className={ classnames( {
					'license-preview__card': true,
					'license-preview__card--is-detached': licenseState === LicenseState.Detached,
					'license-preview__card--is-revoked': licenseState === LicenseState.Revoked,
					'license-preview__card--child-license': isChildLicense,
				} ) }
			>
				<div>
					<span className="license-preview__product">{ product }</span>
				</div>

				<div>
					{ quantity ? (
						<div className="license-preview__bundle">
							<Gridicon icon="minus" className="license-preview__no-value" />
							<div className="license-preview__product-small">{ product }</div>
							<div>{ bundleCountContent }</div>
						</div>
					) : (
						<>
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
						</>
					) }
				</div>

				<div>
					{ quantity ? (
						<Gridicon icon="minus" className="license-preview__no-value" />
					) : (
						<>
							<div className="license-preview__label">{ translate( 'Issued on:' ) }</div>

							<FormattedDate date={ issuedAt } format="YYYY-MM-DD" />
						</>
					) }
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

				<div className="license-preview__badge-container">
					{ isParentLicense
						? bundleCountContent
						: LicenseType.Standard === licenseType && (
								<Badge type="success">{ translate( 'Standard license' ) }</Badge>
						  ) }
				</div>
			</LicenseListItem>
		</div>
	);
}
