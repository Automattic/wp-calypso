import { useI18n } from '@wordpress/react-i18n';
import React, { useCallback } from 'react';
import { transferDomainAction } from 'calypso/components/domains/use-my-domain/utilities';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import DomainStepAuthCode from './domain-step-auth-code';

import './style.scss';

const TransferDomainStepAuthCode = ( { className, domain, pageSlug, progressStepList } ) => {
	const { __ } = useI18n();
	const recordTransferButtonClickInUseYourDomain = useCallback(
		() => recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain } ),
		[ domain ]
	);
	return (
		<DomainStepAuthCode
			buttonMessage={ __( 'Check readiness for transfer' ) }
			className={ className }
			domain={ domain }
			onBeforeValidate={ recordTransferButtonClickInUseYourDomain }
			validateHandler={ transferDomainAction }
			pageSlug={ pageSlug }
			progressStepList={ progressStepList }
		/>
	);
};

export default TransferDomainStepAuthCode;
