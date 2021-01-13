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

/**
 * Style dependencies
 */
import './style.scss';
import { Button, Card, CompactCard } from '@automattic/components';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Gridicon from 'calypso/components/gridicon';
import FormattedDate from 'calypso/components/formatted-date';

function LicenseListHeader() {
	const translate = useTranslate();

	return (
		<>
			<CardHeading size={ 36 }>{ translate( 'Licenses' ) }</CardHeading>

			<CompactCard>
				<div className="license-list__item">
					<div>{ translate( 'License state' ) }</div>
					<div>{ translate( 'Issued on' ) }</div>
					<div>{ translate( 'Attached on' ) }</div>
					<div>{ /* Intentionally empty header. */ }</div>
					<div>{ /* Intentionally empty header. */ }</div>
				</div>
			</CompactCard>
		</>
	);
}

function LicensePreview() {
	const translate = useTranslate();

	return (
		<CompactCard>
			<div className="license-preview license-list__item">
				<div>
					<h3 className="license-list__item-title">example.org</h3>
					{ translate( 'Product: %s', { args: [ 'Jetpack Security Daily' ] } ) }
				</div>
				<div>
					<FormattedDate date="2020-11-24 18:24:52" format="YYYY-MM-DD" />
				</div>
				<div>
					<FormattedDate date="2020-11-25 18:24:52" format="YYYY-MM-DD" />
				</div>
				<div>
					<ClipboardButton
						text="Text to copy"
						className="license-preview__copy-license-key"
						compact
					>
						{ translate( 'Copy License' ) }
					</ClipboardButton>
				</div>
				<div>
					<Button borderless compact>
						<Gridicon icon="chevron-down" />
					</Button>
				</div>
			</div>
		</CompactCard>
	);
}

function LicenseDetails() {
	const translate = useTranslate();

	return (
		<Card>
			<div className="license-details">
				<ul className="license-details__list">
					<li className="license-details__list-item license-details__list-item--wide">
						<h4 className="license-details__label">{ translate( 'License code' ) }</h4>

						<code className="license-details__license-key">premium_AcNAyEhPaSXeFVgRj0gZkgn0Z</code>

						<ClipboardButton
							text="Text to copy"
							className="license-details__clipboard-button"
							borderless
							compact
						>
							<Gridicon icon="clipboard" />
						</ClipboardButton>
					</li>
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Issued on' ) }</h4>
						<FormattedDate date="2020-11-24 18:24:52" format="LLL" />
					</li>
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Attached on' ) }</h4>
						<FormattedDate date="2020-11-25 18:24:52" format="LLL" />
					</li>
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( "Owner's User ID" ) }</h4>
						<span>1234567890</span>
					</li>
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Blog ID' ) }</h4>
						<span>1234567890</span>
					</li>
				</ul>
				<div className="license-details__actions">
					<Button scary>{ translate( 'Revoke License' ) }</Button>
				</div>
			</div>
		</Card>
	);
}

export default function LicenseList() {
	return (
		<>
			<Main wideLayout={ true } className="license-list">
				<LicenseListHeader />

				<LicensePreview />

				<LicenseDetails />
			</Main>
		</>
	);
}
