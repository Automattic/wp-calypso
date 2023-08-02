import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isDomainRegistration, isPlan } from '@automattic/calypso-products';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import ChatButton from 'calypso/components/chat-button';
import MaterialIcon from 'calypso/components/material-icon';
import { hasIncludedDomain } from 'calypso/lib/purchases';
import { useSelector } from 'calypso/state';
import { getSiteUrl } from 'calypso/state/sites/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { FC } from 'react';
import './style.scss';

type Props = {
	icon?: string;
	purchase: Purchase;
	surveyStep?: string;
	onClick: () => void;
	className?: string;
};

const PrecancellationChatButton: FC< Props > = ( {
	icon,
	purchase,
	surveyStep = '',
	onClick,
	className,
} ) => {
	const { __ } = useI18n();
	const siteUrl =
		useSelector( ( state ) => getSiteUrl( state, purchase.siteId ) ) || 'Unknown site';

	const handleClick = () => {
		recordTracksEvent( 'calypso_precancellation_chat_click', {
			survey_step: surveyStep,
			purchase: purchase.productSlug,
			is_plan: isPlan( purchase ),
			is_domain_registration: isDomainRegistration( purchase ),
			has_included_domain: hasIncludedDomain( purchase ),
		} );

		onClick();
	};

	const purchaseDomain = purchase.isDomain
		? `domain: ${ purchase.meta }`
		: `site: ${ purchase.domain }`;
	const initialMessage =
		'User is contacting us from the pre-cancellation flow.\n' +
		"Product they're attempting to cancel: " +
		`${ purchase.productName } (slug: ${ purchase.productSlug }, ${ purchaseDomain })`;

	return (
		<ChatButton
			chatIntent="PRECANCELLATION"
			initialMessage={ initialMessage }
			siteUrl={ siteUrl }
			className={ classNames( 'precancellation-chat-button__main-button', className ) }
			onClick={ handleClick }
		>
			{ icon && <MaterialIcon icon={ icon } /> }
			{ __( 'Need help? Chat with us' ) }
		</ChatButton>
	);
};

export default PrecancellationChatButton;
