/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import LicenseListItem from 'calypso/jetpack-cloud/sections/partner-portal/license-list-item';
import LicensePreview from 'calypso/jetpack-cloud/sections/partner-portal/license-preview';

export default function LicenseList() {
	const translate = useTranslate();

	const data = [
		{
			licenseKey: 'jetpack-security-daily_AcNAyEhPaSXeFVgRj0gZkgn0Z',
			siteUrl: 'https://yetanothersite.net',
			product: 'Jetpack Security Daily',
			issuedAt: '2020-11-26 18:24:52',
			attachedAt: '2020-11-27 18:24:52',
			revokedAt: '',
			username: 'ianramosc',
			blogId: 883882032,
		},
		{
			licenseKey: 'jetpack-backup-daily_AcNAyEhPaSXeFVgRj0gZkgn0Z',
			siteUrl: '',
			product: 'Jetpack Backup Daily',
			issuedAt: '2020-11-26 18:24:52',
			attachedAt: '',
			revokedAt: '',
			username: 'ianramosc',
			blogId: 883882032,
		},
		{
			licenseKey: 'jetpack-security-realtime_AcNAyEhPaSXeFVgRj0gZkgn0Z',
			siteUrl: 'https://mygroovysite.co.uk',
			product: 'Jetpack Security Real-time',
			issuedAt: '2020-11-24 18:24:52',
			attachedAt: '2020-11-25 18:24:52',
			revokedAt: '',
			username: 'ianramosc',
			blogId: 883882032,
		},
		{
			licenseKey: 'security-daily_AcNAyEhPaSXeFVgRj0gZkgn0Z',
			siteUrl: 'https://mylicenselesssite.com',
			product: 'Security Daily',
			issuedAt: '2020-11-24 18:24:52',
			attachedAt: '2020-11-25 18:24:52',
			revokedAt: '2020-11-25 18:24:52',
			username: 'ianramosc',
			blogId: 883882032,
		},
	];

	return (
		<Main wideLayout={ true } className="license-list">
			<DocumentHead title={ translate( 'Licenses' ) } />

			<CardHeading size={ 36 }>{ translate( 'Licenses' ) }</CardHeading>

			<LicenseListItem header>
				<h2>{ translate( 'License state' ) }</h2>
				<h2>{ translate( 'Issued on' ) }</h2>
				<h2>{ translate( 'Attached on' ) }</h2>
				<h2>{ translate( 'Revoked on' ) }</h2>
				<div>{ /* Intentionally empty header. */ }</div>
				<div>{ /* Intentionally empty header. */ }</div>
			</LicenseListItem>

			{ data.map( ( license ) => (
				<LicensePreview
					key={ license.licenseKey }
					licenseKey={ license.licenseKey }
					product={ license.product }
					username={ license.username }
					blogId={ license.blogId }
					siteUrl={ license.siteUrl }
					issuedAt={ license.issuedAt }
					attachedAt={ license.attachedAt }
					revokedAt={ license.revokedAt }
				/>
			) ) }
		</Main>
	);
}
