// Legacy Node resolution cannot consume the package's conditional subpath types directly.
declare module '@automattic/jetpack-ai-sidebar/free-credit-notice' {
	import type {
		FreeCreditNoticeProps,
		JetpackAiChatNotice,
	} from '@automattic/jetpack-ai-sidebar/src/free-credit-notice-types';

	export type { JetpackAiChatNotice };
	export function useJetpackFreeCreditChatNotice(
		props: FreeCreditNoticeProps
	): JetpackAiChatNotice | undefined;
}
