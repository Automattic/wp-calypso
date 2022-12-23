import { createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import { connectDomainAction } from 'calypso/components/domains/use-my-domain/utilities';
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
	const authCodeDescription = (
		<>
			<p className="connect-domain-step__text">
				{ __(
					'We will use your domain authorization code to verify that you are the domain owner.'
				) }
			</p>
			<p className="connect-domain-step__text">{ authCodeStepDefaultDescription.label }</p>
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
