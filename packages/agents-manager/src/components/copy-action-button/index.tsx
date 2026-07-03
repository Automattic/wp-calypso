import { Button } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { copy, check } from '@wordpress/icons';
import './style.scss';

interface Props {
	text: string;
}

export default function CopyActionButton( { text }: Props ) {
	const [ isCopied, setIsCopied ] = useState( false );
	const timerRef = useRef< ReturnType< typeof setTimeout > >( undefined );

	const handleClick = async () => {
		try {
			await navigator.clipboard.writeText( text );
			setIsCopied( true );
			clearTimeout( timerRef.current );
			timerRef.current = setTimeout( () => setIsCopied( false ), 2000 );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[AgentsManager] Failed to copy text to clipboard:', error );
		}
	};

	useEffect( () => () => clearTimeout( timerRef.current ), [] );

	return (
		<Button
			className="agents-manager-copy-action-button"
			icon={ isCopied ? check : copy }
			label={ isCopied ? __( 'Copied', __i18n_text_domain__ ) : __( 'Copy', __i18n_text_domain__ ) }
			onClick={ handleClick }
			size="compact"
		/>
	);
}
