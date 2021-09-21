import { useI18n } from '@wordpress/react-i18n';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { connectDomainAction } from 'calypso/components/domains/use-my-domain/utilities';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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
	return (
		<DomainStepAuthCode
			buttonMessage={ __( 'Check my authorization code' ) }
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
