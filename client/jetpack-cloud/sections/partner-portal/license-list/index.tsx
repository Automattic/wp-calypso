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
import { CompactCard } from '@automattic/components';
import DocumentHead from 'calypso/components/data/document-head';
import LicenseListItem from 'calypso/jetpack-cloud/sections/partner-portal/license-list-item';
import LicensePreview from 'calypso/jetpack-cloud/sections/partner-portal/license-preview';

export default function LicenseList() {
	const translate = useTranslate();

	const data = [
		{
			licenseKey: 'jetpack-security-daily_AcNAyEhPaSXeFVgRj0gZkgn0Z',
			domain: 'yetanothersite.net',
			product: 'Jetpack Security Daily',
			issuedOn: '2020-11-26 18:24:52',
			attachedOn: '2020-11-27 18:24:52',
			revokedOn: '',
			username: 'ianramosc',
			blogId: 883882032,
		},
		{
			licenseKey: 'jetpack-backup-daily_AcNAyEhPaSXeFVgRj0gZkgn0Z',
			domain: '',
			product: 'Jetpack Backup Daily',
			issuedOn: '2020-11-26 18:24:52',
			attachedOn: '',
			revokedOn: '',
			username: 'ianramosc',
			blogId: 883882032,
		},
		{
			licenseKey: 'jetpack-security-realtime_AcNAyEhPaSXeFVgRj0gZkgn0Z',
			domain: 'mygroovysite.co.uk',
			product: 'Jetpack Security Real-time',
			issuedOn: '2020-11-24 18:24:52',
			attachedOn: '2020-11-25 18:24:52',
			revokedOn: '',
			username: 'ianramosc',
			blogId: 883882032,
		},
		{
			licenseKey: 'security-daily_AcNAyEhPaSXeFVgRj0gZkgn0Z',
			domain: 'mylicenselesssite.com',
			product: 'Security Daily',
			issuedOn: '2020-11-24 18:24:52',
			attachedOn: '2020-11-25 18:24:52',
			revokedOn: '2020-11-25 18:24:52',
			username: 'ianramosc',
			blogId: 883882032,
		},
	];

	return (
		<Main wideLayout={ true } className="license-list">
			<DocumentHead title={ translate( 'Licenses' ) } />

			<CardHeading size={ 36 }>{ translate( 'Licenses' ) }</CardHeading>

			<CompactCard>
				<LicenseListItem header>
					<h2>{ translate( 'License state' ) }</h2>
					<h2>{ translate( 'Issued on' ) }</h2>
					<h2>{ translate( 'Attached on' ) }</h2>
					<h2>{ translate( 'Revoked on' ) }</h2>
					<h2>{ /* Intentionally empty header. */ }</h2>
					<h2>{ /* Intentionally empty header. */ }</h2>
				</LicenseListItem>
			</CompactCard>

			{ data.map( ( license ) => (
				<LicensePreview
					key={ license.licenseKey }
					licenseKey={ license.licenseKey }
					domain={ license.domain }
					product={ license.product }
					issuedOn={ license.issuedOn }
					attachedOn={ license.attachedOn }
					revokedOn={ license.revokedOn }
					username={ license.username }
					blogId={ license.blogId }
				/>
			) ) }
		</Main>
	);
}
