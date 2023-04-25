import config from '@automattic/calypso-config';
import { useIsLoggedIn } from '@automattic/data-stores/src/reader/hooks';
import { useLocale } from '@automattic/i18n-utils';
import Separator from 'calypso/components/popover-menu/separator';
import SettingsPopover from '../settings-popover';
import EmailMeNewCommentsToggle from './email-me-new-comments-toggle';
import UnsubscribeCommentsButton from './unsubscribe-comments-button';

type CommentSettingsProps = {
	onUnsubscribe: () => void;
	unsubscribing: boolean;
};

const CommentSettings = ( { onUnsubscribe, unsubscribing }: CommentSettingsProps ) => {
	const { isLoggedIn } = useIsLoggedIn();
	const locale = useLocale();
	const shouldEnableCommentToggles =
		config.isEnabled( 'subscription-management/comments-list-toggles' ) && locale === 'en';

	return (
		<SettingsPopover>
			{ shouldEnableCommentToggles && isLoggedIn && (
				<>
					<EmailMeNewCommentsToggle isUpdating={ false } />
					<Separator />
				</>
			) }
			<UnsubscribeCommentsButton unsubscribing={ unsubscribing } onUnsubscribe={ onUnsubscribe } />
		</SettingsPopover>
	);
};

export default CommentSettings;
