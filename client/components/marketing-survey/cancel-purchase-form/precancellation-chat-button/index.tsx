import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isDomainRegistration, isPlan } from '@automattic/calypso-products';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ChatButton from 'calypso/components/chat-button';
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
	label?: string;
};

const PrecancellationChatButton: FC< Props > = ( {
	purchase,
	surveyStep = '',
	onClick,
	className,
	label,
} ) => {
	const translate = useTranslate();
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
			siteId={ purchase?.siteId }
			className={ clsx( 'precancellation-chat-button__main-button', className ) }
			onClick={ handleClick }
			section="pre-cancellation"
		>
			{ label ||
				translate( 'Need help? {{span}}Contact us{{/span}}', {
					components: { span: <span /> },
				} ) }
		</ChatButton>
	);
};

export default PrecancellationChatButton;
