/**
 * External dependencies
 */
import React, { useState, useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import classnames from 'classnames';

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
				<div className="license-list__item license-list__item--header">
					<h2>{ translate( 'License state' ) }</h2>
					<h2>{ translate( 'Issued on' ) }</h2>
					<h2>{ translate( 'Attached on' ) }</h2>
					<h2>{ /* Intentionally empty header. */ }</h2>
					<h2>{ /* Intentionally empty header. */ }</h2>
				</div>
			</CompactCard>
		</>
	);
}

function LicensePreview( { licenseKey, domain, product, issuedOn, attachedOn } ) {
	const translate = useTranslate();
	const [ isOpen, setOpen ] = useState();

	const open = useCallback( () => {
		setOpen( ! isOpen );
	}, [ isOpen ] );

	return (
		<>
			<CompactCard
				className={ classnames( {
					'license-preview': true,
					'license-preview--is-open': isOpen,
				} ) }
			>
				<div className="license-list__item">
					<div>
						{ domain && <h3 className="license-preview__domain">{ domain }</h3> }

						{ ! domain && <h3 className="license-preview__domain">{ 'WIP: Detached' }</h3> }

						<span>{ translate( 'Product: %s', { args: [ product ] } ) }</span>
					</div>

					<div>
						<FormattedDate date={ issuedOn } format="YYYY-MM-DD" />
					</div>

					<div>
						{ attachedOn && <FormattedDate date={ attachedOn } format="YYYY-MM-DD" /> }
						{ ! attachedOn && <>&mdash;</> }
					</div>

					<div>
						{ ! domain && (
							<ClipboardButton
								text={ licenseKey }
								className="license-preview__copy-license-key"
								compact
							>
								{ translate( 'Copy License' ) }
							</ClipboardButton>
						) }
					</div>

					<div>
						<Button onClick={ open } borderless>
							<Gridicon icon={ isOpen ? 'chevron-up' : 'chevron-down' } />
						</Button>
					</div>
				</div>
			</CompactCard>

			{ isOpen && (
				<LicenseDetails
					licenseKey={ 'jetpack-security-realtime_AcNAyEhPaSXeFVgRj0gZkgn0Z' }
					issuedOn={ '2020-11-24 18:24:52' }
					attachedOn={ '2020-11-25 18:24:52' }
					username={ 'ianramosc' }
					blogId={ '883882032' }
				/>
			) }
		</>
	);
}

function LicenseDetails( { licenseKey, issuedOn, attachedOn, username, blogId } ) {
	const translate = useTranslate();

	return (
		<Card>
			<div className="license-details">
				<ul className="license-details__list">
					<li className="license-details__list-item license-details__list-item--wide">
						<h4 className="license-details__label">{ translate( 'License code' ) }</h4>

						<code className="license-details__license-key">{ licenseKey }</code>

						<ClipboardButton
							text={ licenseKey }
							className="license-details__clipboard-button"
							borderless
							compact
						>
							<Gridicon icon="clipboard" />
						</ClipboardButton>
					</li>
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Issued on' ) }</h4>
						<FormattedDate date={ issuedOn } format="LLL" />
					</li>
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Attached on' ) }</h4>
						<FormattedDate date={ attachedOn } format="LLL" />
					</li>
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( "Owner's User ID" ) }</h4>
						<span>{ username }</span>
					</li>
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Blog ID' ) }</h4>
						<span>{ blogId }</span>
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

				<LicensePreview
					licenseKey={ 'jetpack-security-realtime_AcNAyEhPaSXeFVgRj0gZkgn0Z' }
					domain={ 'yetanothersite.net' }
					product={ 'Jetpack Security Daily' }
					issuedOn={ '2020-11-26 18:24:52' }
					attachedOn={ '2020-11-27 18:24:52' }
				/>

				<LicensePreview
					licenseKey={ 'jetpack-security-realtime_AcNAyEhPaSXeFVgRj0gZkgn0Z' }
					domain={ '' }
					product={ 'Jetpack Backup Daily' }
					issuedOn={ '2020-11-26 17:12:32' }
					attachedOn={ '' }
				/>

				<LicensePreview
					licenseKey={ 'jetpack-security-realtime_AcNAyEhPaSXeFVgRj0gZkgn0Z' }
					domain={ 'mygroovysite.co.uk' }
					product={ 'Jetpack Security Real-time' }
					issuedOn={ '2020-11-24 18:24:52' }
					attachedOn={ '2020-11-25 18:24:52' }
				/>
			</Main>
		</>
	);
}
