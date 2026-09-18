import { isSupportSession } from '@automattic/calypso-support-session';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { globe } from '@wordpress/icons';
import { Suspense, lazy, useState } from 'react';
import { useSessionLocale } from '../locale/session-locale';
import { getUserLanguage } from '../shared-locale-loader';
import type { User } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

const OmnibarLanguageSwitcherModal = lazy(
	() =>
		import(
			/* webpackChunkName: "async-omnibar-language-switcher" */ './omnibar-language-switcher-modal'
		)
);

export function useLanguageSwitcherPlugin( { user }: { user?: User } ): {
	node?: OmnibarNode;
	panel?: React.ReactNode;
} {
	const sessionLocale = useSessionLocale();
	const [ isOpen, setIsOpen ] = useState( false );

	if ( ! isSupportSession() ) {
		return {};
	}

	const currentLocale = sessionLocale ?? getUserLanguage( user );

	return {
		node: {
			id: 'language-switcher',
			title: currentLocale,
			label: __( 'Change language' ),
			icon: <Icon icon={ globe } />,
			onClick: () => setIsOpen( true ),
		},
		panel: isOpen && (
			<Suspense fallback={ null }>
				<OmnibarLanguageSwitcherModal
					currentLocale={ currentLocale }
					onClose={ () => setIsOpen( false ) }
				/>
			</Suspense>
		),
	};
}
