/**
 * External dependencies
 */
import { Button, Card } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import domainConnectedIllustration from 'calypso/assets/images/illustrations/domain-connected.svg';
import CardHeading from 'calypso/components/card-heading';
import Gridicon from 'calypso/components/gridicon';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { stepType } from './constants';
/**
 * Style dependencies
 */
import './style.scss';

function ConnectDomainStepDone( { className, domain, step, selectedSiteSlug } ) {
	const siteDomainsUrl = domainManagementList( selectedSiteSlug );

	const illustration = domainConnectedIllustration && (
		<img src={ domainConnectedIllustration } alt="" width={ 150 } />
	);

	let heading = (
		<>
			<Gridicon
				className={ className + '__connected-heading-checkmark' }
				icon="checkmark"
				size={ 24 }
			/>
			{ __( 'Your domain is connected' ) }
		</>
	);

	let contentLines = [
		sprintf(
			/* translators: %s: the domain name that was connected to the user's site (ex.: example.com) */
			__( "That's it. %s has been successfully connected." ),
			domain
		),
	];

	if ( stepType.VERIFYING === step ) {
		heading = __( 'We are verifying your connection now' );
		contentLines = [
			sprintf(
				/* translators: %s: the domain name that is being verified (ex.: example.com) */
				__(
					"That's it! This will take between a few minutes to 72 hours. You can continue to work on your site, but %s won't be reachable just yet."
				),
				domain
			),
			createInterpolateElement( __( 'You will see the status in <a>site domains</a>.' ), {
				a: createElement( 'a', { href: siteDomainsUrl } ),
			} ),
		];
	}

	return (
		<Card className={ className }>
			<div className={ className + '__connected' }>
				<div className={ className + '__connected-illustration' }>{ illustration }</div>
				<CardHeading className={ className + '__connected-heading' } size={ 24 }>
					{ heading }
				</CardHeading>
				<div className={ className + '__connected-content' }>
					{ contentLines.map( ( text, index ) => (
						<div key={ index } className={ className + '__connected-content-text' }>
							{ text }
						</div>
					) ) }
				</div>
				<div className={ className + '__connected-actions' }>
					<Button primary href={ siteDomainsUrl }>
						{ __( 'Back to Site Domains' ) }
					</Button>
				</div>
			</div>
		</Card>
	);
}

ConnectDomainStepDone.propTypes = {
	className: PropTypes.string,
	domain: PropTypes.string.isRequired,
	step: PropTypes.oneOf( Object.values( stepType ) ).isRequired,
	selectedSiteSlug: PropTypes.string,
};

export default connect( ( state ) => ( { selectedSiteSlug: getSelectedSiteSlug( state ) } ) )(
	ConnectDomainStepDone
);
