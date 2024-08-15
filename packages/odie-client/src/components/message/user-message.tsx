import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Markdown from 'react-markdown';
import { useOdieAssistantContext } from '../../context';
import CustomALink from './custom-a-link';
import { DirectEscalationLink } from './direct-escalation-link';
import { uriTransformer } from './uri-transformer';
import WasThisHelpfulButtons from './was-this-helpful-buttons';
import type { Message } from '../../types/';

export const UserMessage = ( {
	message,
	onDislike,
	isDisliked = false,
}: {
	isDisliked?: boolean;
	message: Message;
	onDislike: () => void;
} ) => {
	const { extraContactOptions, isUserElegible } = useOdieAssistantContext();
	const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support;
	const hasFeedback = !! message?.rating_value;
	const isUser = message.role === 'user';
	const isAgent = message.role === 'agent';
	const isPositiveFeedback =
		hasFeedback && message && message.rating_value && +message.rating_value === 1;
	const showExtraContactOptions =
		( hasFeedback && ! isPositiveFeedback ) || isRequestingHumanSupport;
	const supportForumWording = __(
		'It sounds like you want to talk to a human. Human support is only available for our [paid plans](https://wordpress.com/pricing/). For community support, visit our forums:',
		__i18n_text_domain__
	);

	const supportHappinessWording = __(
		'It sounds like you want to talk to a human. We’re here to help! Use the option below to message our Happiness Engineers.',
		__i18n_text_domain__
	);

	const forwardMessage = isUserElegible ? supportHappinessWording : supportForumWording;

	return (
		<>
			<Markdown
				urlTransform={ uriTransformer }
				components={ {
					a: CustomALink,
				} }
			>
				{ isRequestingHumanSupport ? forwardMessage : message.content }
			</Markdown>
			{ showExtraContactOptions && extraContactOptions }
			{ ! hasFeedback && ! ( isUser || isAgent ) && (
				<WasThisHelpfulButtons
					message={ message }
					onDislike={ onDislike }
					isDisliked={ isDisliked }
				/>
			) }
			{ ! isUser && ! isAgent && (
				<>
					{ ! showExtraContactOptions && <DirectEscalationLink messageId={ message.message_id } /> }
					<div className="disclaimer">
						{ __(
							"Generated by WordPress.com's Support AI. AI-generated responses may contain inaccurate information.",
							__i18n_text_domain__
						) }
						<ExternalLink href="https://automattic.com/ai-guidelines">
							{ ' ' }
							{ __( 'Learn more.', __i18n_text_domain__ ) }
						</ExternalLink>
					</div>
				</>
			) }
		</>
	);
};
