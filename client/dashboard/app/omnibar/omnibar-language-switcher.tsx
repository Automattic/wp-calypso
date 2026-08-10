import { Suspense, lazy, useState } from 'react';
import { useOmnibarEvent } from './events';

const OmnibarLanguageSwitcherModal = lazy(
	() =>
		import(
			/* webpackChunkName: "async-omnibar-language-switcher" */ './omnibar-language-switcher-modal'
		)
);

export default function OmnibarLanguageSwitcher() {
	const [ isOpen, setIsOpen ] = useState( false );

	useOmnibarEvent( 'languageSwitcher', () => setIsOpen( true ) );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Suspense fallback={ null }>
			<OmnibarLanguageSwitcherModal onClose={ () => setIsOpen( false ) } />
		</Suspense>
	);
}
