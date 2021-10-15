import { withShoppingCart } from '@automattic/shopping-cart';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import { transferDomainAction } from 'calypso/components/domains/use-my-domain/utilities';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { authCodeStepDefaultDescription, stepsHeading } from './constants';
import DomainStepAuthCode from './domain-step-auth-code';

import './style.scss';

const TransferDomainStepAuthCode = ( {
	className,
	domain,
	pageSlug,
	transferDomainActionHandler,
	progressStepList,
	...props
} ) => {
	const { __ } = useI18n();
	const recordTransferButtonClickInUseYourDomain = useCallback(
		() => recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain } ),
		[ domain ]
	);
	const authCodeDescription = (
		<p className={ 'connect-domain-step__text' }>{ authCodeStepDefaultDescription }</p>
	);
	return (
		<DomainStepAuthCode
			{ ...props }
			buttonMessage={ __( 'Check readiness for transfer' ) }
			customHeading={ stepsHeading.TRANSFER }
			authCodeDescription={ authCodeDescription }
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
} )( withCartKey( withShoppingCart( TransferDomainStepAuthCode ) ) );
