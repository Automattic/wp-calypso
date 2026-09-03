import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isDomainRegistration, isPlan } from '@automattic/calypso-products';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ChatButton from 'calypso/components/chat-button';
import { useSelector } from 'calypso/state';
import { getSiteUrl } from 'calypso/state/sites/selectors';
import type { Purchase } from '@automattic/api-core';
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
	purchase,
	surveyStep = '',
	onClick,
	className,
} ) => {
	const translate = useTranslate();
	const siteUrl =
		useSelector( ( state ) => getSiteUrl( state, purchase.blog_id ) ) || 'Unknown site';

	const handleClick = () => {
		recordTracksEvent( 'calypso_precancellation_chat_click', {
			survey_step: surveyStep,
			purchase: purchase.product_slug,
			is_plan: isPlan( purchase ),
			is_domain_registration: isDomainRegistration( purchase ),
			has_included_domain: Boolean( purchase.included_domain ),
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
			siteUrl={ siteUrl }
			siteId={ purchase?.blog_id }
			className={ clsx( 'precancellation-chat-button__main-button', className ) }
			onClick={ handleClick }
			section="pre-cancellation"
		>
			{ translate( 'Need help?' ) }
		</ChatButton>
	);
};

export default PrecancellationChatButton;
