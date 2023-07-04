import { Button, Card, Gridicon } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import domainConnectedIllustration from 'calypso/assets/images/domains/connect.svg';
import CardHeading from 'calypso/components/card-heading';
import { useCurrentRoute } from 'calypso/components/route';
import { isSubdomain } from 'calypso/lib/domains';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { stepType } from './constants';

import './style.scss';

const ConnectDomainStepDone = ( {
	className,
	domain,
	step,
	selectedSiteSlug,
	queryError,
	queryErrorDescription,
} ) => {
	const { __ } = useI18n();
	const { currentRoute } = useCurrentRoute();
	const siteDomainsUrl = domainManagementList( selectedSiteSlug, currentRoute );

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
			{ isSubdomain( domain )
				? __( 'Your subdomain is connected' )
				: __( 'Your domain is connected' ) }
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

		if ( queryError ) {
			if ( queryError === 'access_denied' && queryErrorDescription.startsWith( 'user_cancel' ) ) {
				heading = __( 'Connecting your domain to WordPress.com was cancelled' );
				contentLines = [
					sprintf(
						/* translators: %s: the domain name that is being connected (ex.: example.com) */
						__(
							'You might want to start over or use one of the alternative methods to connect %s to WordPress.com.'
						),
						domain
					),
				];
			} else {
				heading = __( 'There was a problem connecting your domain' );
				contentLines = [
					sprintf(
						/* translators: %s: the domain name that is being connected (ex.: example.com) */
						__(
							'We got an error when trying to connect %s to WordPress.com. You might try again or get in contact with your DNS provider to figure out what went wrong.'
						),
						domain
					),
				];
			}
		}
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
};

ConnectDomainStepDone.propTypes = {
	className: PropTypes.string,
	domain: PropTypes.string.isRequired,
	step: PropTypes.oneOf( Object.values( stepType ) ).isRequired,
	selectedSiteSlug: PropTypes.string,
	queryError: PropTypes.string,
	queryErrorDescription: PropTypes.string,
};

export default connect( ( state ) => ( { selectedSiteSlug: getSelectedSiteSlug( state ) } ) )(
	ConnectDomainStepDone
);
