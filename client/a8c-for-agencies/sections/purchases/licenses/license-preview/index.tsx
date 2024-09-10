import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import { Badge, Button, Gridicon } from '@automattic/components';
import { Icon, external } from '@wordpress/icons';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState, useContext } from 'react';
import { A4A_SITES_LINK_NEEDS_SETUP } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import {
	isPressableHostingProduct,
	isWPCOMHostingProduct,
} from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import ClientSite from 'calypso/a8c-for-agencies/sections/sites/needs-setup-sites/client-site';
import FormattedDate from 'calypso/components/formatted-date';
import getLicenseState from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-license-state';
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
import { getSite } from 'calypso/state/sites/selectors';
import usePaymentMethod from '../../payment-methods/hooks/use-payment-method';
import LicenseDetails from '../license-details';
import BundleDetails from '../license-details/bundle-details';
import LicensesOverviewContext from '../licenses-overview/context';
import LicenseActions from './license-actions';
import LicenseBundleDropDown from './license-bundle-dropdown';
import type { ReferralAPIResponse } from 'calypso/a8c-for-agencies/sections/referrals/types';

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
	referral?: ReferralAPIResponse | null;
}

export default function LicensePreview( {
	licenseKey,
	blogId,
	product,
	siteUrl,
	hasDownloads,
	issuedAt,
	attachedAt,
	revokedAt,
	licenseType,
	parentLicenseId,
	quantity,
	isChildLicense,
	referral,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isAutomatedReferralsEnabled = config.isEnabled( 'a4a-automated-referrals' );

	const site = useSelector( ( state ) => getSite( state, blogId as number ) );
	const isPressableLicense = isPressableHostingProduct( licenseKey );
	const isWPCOMLicense = isWPCOMHostingProduct( licenseKey );
	const pressableManageUrl = 'https://my.pressable.com/agency/auth';

	const { filter } = useContext( LicensesOverviewContext );

	const isHighlighted = getQueryArg( window.location.href, 'highlight' ) === licenseKey;

	const [ isOpen, setOpen ] = useState( isHighlighted );

	const open = useCallback( () => {
		setOpen( ! isOpen );
		dispatch( recordTracksEvent( 'calypso_a4a_license_list_preview_toggle' ) );
	}, [ dispatch, isOpen ] );

	const onCopyLicense = useCallback( () => {
		dispatch( infoNotice( translate( 'License copied!' ), { duration: 2000 } ) );
		dispatch( recordTracksEvent( 'calypso_a4a_license_list_copy_license_click' ) );
	}, [ dispatch, translate ] );

	const { paymentMethodRequired } = usePaymentMethod();
	const licenseState = getLicenseState( attachedAt, revokedAt );
	const domain = siteUrl && ! isPressableLicense ? getUrlParts( siteUrl ).hostname || siteUrl : '';

	const assign = useCallback( () => {
		const redirectUrl = isWPCOMLicense
			? A4A_SITES_LINK_NEEDS_SETUP
			: addQueryArgs( { key: licenseKey }, '/marketplace/assign-license' );
		if ( paymentMethodRequired ) {
			const noticeLinkHref = addQueryArgs(
				{
					return: redirectUrl,
				},
				'/purchases/payment-methods/add'
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
	}, [ isWPCOMLicense, licenseKey, paymentMethodRequired, translate, dispatch ] );

	useEffect( () => {
		if ( isHighlighted ) {
			page.redirect(
				removeQueryArgs( window.location.pathname + window.location.search, 'highlight' )
			);
		}
	}, [ isHighlighted ] );

	const isParentLicense = quantity && parentLicenseId;

	const isSiteAtomic = site?.is_wpcom_atomic;

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

	// TODO: We are removing Creator's product name in the frontend because we want to leave it in the backend for the time being,
	//       We have to refactor this once we have updates. Context: p1714663834375719-slack-C06JY8QL0TU
	const productTitle = licenseKey.startsWith( 'wpcom-hosting-business' )
		? translate( 'WordPress.com Site' )
		: product;

	return (
		<div
			className={ clsx( {
				'license-preview': true,
				'license-preview--is-open': isOpen && ! isChildLicense,
			} ) }
		>
			<LicenseListItem
				className={ clsx( {
					'license-preview__card': true,
					'license-preview__card--is-detached': licenseState === LicenseState.Detached,
					'license-preview__card--is-revoked': licenseState === LicenseState.Revoked,
					'license-preview__card--child-license': isChildLicense,
				} ) }
			>
				<div>
					<span className="license-preview__product">
						{ productTitle }
						{ isAutomatedReferralsEnabled && referral && (
							<div className="license-preview__client-email">
								<ClientSite referral={ referral } />
							</div>
						) }
					</span>
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
							{ isPressableLicense && ! revokedAt && (
								<a
									className="license-preview__product-pressable-link"
									target="_blank"
									rel="norefferer noopener noreferrer"
									href={ pressableManageUrl }
								>
									{ translate( 'Manage in Pressable' ) }
									<Icon className="gridicon" icon={ external } size={ 18 } />
								</a>
							) }
							{ ! domain && licenseState === LicenseState.Detached && (
								<span className="license-preview__unassigned">
									<Badge type="warning">{ translate( 'Unassigned' ) }</Badge>
									{ licenseType === LicenseType.Partner && (
										<Button
											className="license-preview__assign-button"
											borderless
											compact
											onClick={ assign }
										>
											{ isWPCOMLicense ? translate( 'Create site' ) : translate( 'Assign' ) }
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
					{ !! isParentLicense && bundleCountContent }
				</div>

				<div>
					{ !! isParentLicense && ! revokedAt && (
						<LicenseBundleDropDown
							product={ product }
							licenseKey={ licenseKey }
							bundleSize={ quantity }
						/>
					) }
					{ isWPCOMLicense && isSiteAtomic ? (
						<LicenseActions
							siteUrl={ siteUrl }
							attachedAt={ attachedAt }
							revokedAt={ revokedAt }
							licenseType={ licenseType }
							isChildLicense={ isChildLicense }
						/>
					) : (
						<Button onClick={ open } className="license-preview__toggle" borderless>
							<Gridicon icon={ isOpen ? 'chevron-up' : 'chevron-down' } />
						</Button>
					) }
				</div>
			</LicenseListItem>

			{ isOpen &&
				( isParentLicense ? (
					<BundleDetails parentLicenseId={ parentLicenseId } />
				) : (
					<LicenseDetails
						licenseKey={ licenseKey }
						product={ product }
						siteUrl={ siteUrl }
						blogId={ blogId }
						hasDownloads={ hasDownloads }
						issuedAt={ issuedAt }
						attachedAt={ attachedAt }
						revokedAt={ revokedAt }
						onCopyLicense={ onCopyLicense }
						licenseType={ licenseType }
						isChildLicense={ isChildLicense }
						referral={ referral }
					/>
				) ) }
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
