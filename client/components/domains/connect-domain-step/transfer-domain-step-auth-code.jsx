import { withShoppingCart } from '@automattic/shopping-cart';
import { useI18n } from '@wordpress/react-i18n';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { transferDomainAction } from 'calypso/components/domains/use-my-domain/utilities';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { authCodeStepDescription } from './constants';
import DomainStepAuthCode from './domain-step-auth-code';

import './style.scss';

const TransferDomainStepAuthCode = ( {
	className,
	domain,
	pageSlug,
	transferDomainActionHandler,
	progressStepList,
} ) => {
	const { __ } = useI18n();
	const recordTransferButtonClickInUseYourDomain = useCallback(
		() => recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain } ),
		[ domain ]
	);
	return (
		<DomainStepAuthCode
			buttonMessage={ __( 'Check readiness for transfer' ) }
			authCodeDescription={ authCodeStepDescription }
			className={ className }
			domain={ domain }
			onBeforeValidate={ recordTransferButtonClickInUseYourDomain }
			validateHandler={ transferDomainActionHandler }
			pageSlug={ pageSlug }
			progressStepList={ progressStepList }
		/>
	);
};

export default connect( null, {
	transferDomainActionHandler: transferDomainAction,
} )( withShoppingCart( TransferDomainStepAuthCode ) );
