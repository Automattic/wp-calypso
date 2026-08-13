import { isSupportSession } from '@automattic/calypso-support-session';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { globe } from '@wordpress/icons';
import { useSessionLocale } from '../locale/session-locale';
import { getUserLanguage } from '../shared-locale-loader';
import { omnibarEvents } from './events';
import type { User } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

export function useLanguageSwitcherPlugin( { user }: { user?: User } ): OmnibarNode | undefined {
	const sessionLocale = useSessionLocale();

	if ( ! isSupportSession() ) {
		return undefined;
	}

	return {
		id: 'language-switcher',
		title: sessionLocale ?? getUserLanguage( user ),
		label: __( 'Change language' ),
		icon: <Icon icon={ globe } />,
		onClick: () => omnibarEvents.languageSwitcher.emit(),
	};
}
