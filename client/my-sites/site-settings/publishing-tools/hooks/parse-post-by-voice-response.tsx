import type { PostByVoice } from 'calypso/my-sites/site-settings/publishing-tools/types/post-by-voice';
import type { PostByVoiceResponse } from 'calypso/my-sites/site-settings/publishing-tools/types/post-by-voice-response';

export const parsePostByVoiceResponse = ( data: PostByVoiceResponse ): PostByVoice => ( {
	isEnabled: data.is_enabled,
	code: data.code,
} );
