import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useAnalytics } from '../../../app/analytics';
import ChatButton from './chat-button';
import type { Purchase } from '@automattic/api-core';
import type { FC } from 'react';

type Props = {
	icon?: string;
	purchase: Purchase;
	surveyStep?: string;
	onClick: () => void;
	className?: string;
};

const PrecancellationChatButton: FC< Props > = ( {
	purchase,
	surveyStep = '',
	onClick,
	className,
} ) => {
	const { recordTracksEvent } = useAnalytics();

	const handleClick = () => {
		recordTracksEvent( 'calypso_precancellation_chat_click', {
			survey_step: surveyStep,
			purchase: purchase.product_slug,
			is_plan: purchase.is_plan,
			is_domain_registration: purchase.is_domain_registration,
			has_included_domain: purchase.included_domain,
		} );

		onClick();
	};

	const purchaseDomain = purchase.is_domain
		? `domain: ${ purchase.meta }`
		: `site: ${ purchase.domain }`;
	const initialMessage =
		'User is contacting us from the pre-cancellation flow.\n' +
		"Product they're attempting to cancel: " +
		`${ purchase.product_name } (slug: ${ purchase.product_slug }, ${ purchaseDomain })`;

	return (
		<ChatButton
			chatIntent="PRECANCELLATION"
			initialMessage={ initialMessage }
			className={ clsx( 'precancellation-chat-button__main-button', className ) }
			onClick={ handleClick }
			section="pre-cancellation"
		>
			{ __( 'Need help?' ) }
		</ChatButton>
	);
};

export default PrecancellationChatButton;
