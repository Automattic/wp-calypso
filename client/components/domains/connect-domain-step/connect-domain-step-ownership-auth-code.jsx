import { createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { connectDomainAction } from 'calypso/components/domains/use-my-domain/utilities';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { authCodeStepDefaultDescription } from './constants';
import DomainStepAuthCode from './domain-step-auth-code';

import './style.scss';

const ConnectDomainStepOwnershipAuthCode = ( {
	className,
	domain,
	pageSlug,
	connectDomainActionHandler,
	progressStepList,
} ) => {
	const { __ } = useI18n();
	const recordMappingButtonClickInUseYourDomain = useCallback(
		() => recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain } ),
		[ domain ]
	);
	const [ rootDomainProvider, setRootDomainProvider ] = useState( 'unknown' );
	useEffect( () => {
		( async () => {
			try {
				const availability = await wpcom
					.domain( domain )
					.isAvailable( { apiVersion: '1.3', is_cart_pre_check: false } );
				setRootDomainProvider( availability.root_domain_provider );
			} catch {
				setRootDomainProvider( 'unknown' );
			}
		} )();
	} );
	const authCodeDescription = (
		<>
			<p className="connect-domain-step__text">
				{ __(
					'We will use your domain authorization code to verify that you are the domain owner.'
				) }
			</p>
			<p className="connect-domain-step__text">{ authCodeStepDefaultDescription.label }</p>

			{ rootDomainProvider === 'wpcom' && (
				<p className="connect-domain-step__text">
					{ createInterpolateElement(
						__(
							'In the domain settings page, click on <em>Transfer</em> button and, in the next screen, click on <em>Get authorization code</em>. The code will be sent to the contact email address specified for the domain (the option <em>Transfer lock on</em> can remain toggled on).'
						),
						{ em: createElement( 'em' ) }
					) }
				</p>
			) }
			<p className="connect-domain-step__text">
				{ createInterpolateElement(
					__(
						'This will only be used to verify that you own this domain, <strong>we will not transfer it</strong>.'
					),
					{ strong: createElement( 'strong' ) }
				) }
			</p>
		</>
	);
	return (
		<DomainStepAuthCode
			buttonMessage={ __( 'Check my authorization code' ) }
			authCodeDescription={ authCodeDescription }
			className={ className }
			domain={ domain }
			onBeforeValidate={ recordMappingButtonClickInUseYourDomain }
			validateHandler={ connectDomainActionHandler }
			pageSlug={ pageSlug }
			progressStepList={ progressStepList }
		/>
	);
};

export default connect( null, { connectDomainActionHandler: connectDomainAction } )(
	ConnectDomainStepOwnershipAuthCode
);
