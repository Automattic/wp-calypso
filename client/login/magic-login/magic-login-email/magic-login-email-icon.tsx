import React, { useState, useEffect } from 'react';

interface MagicLoginEmailIconProps {
	icon: string;
}

export function MagicLoginEmailIcon( { icon }: MagicLoginEmailIconProps ) {
	const [ IconComponent, setIconComponent ] = useState< React.ReactNode | null >( null );

	useEffect( () => {
		const getIconComponent = async ( iconName: string ) => {
			try {
				// Use dynamic import to load the icons.
				const module = await import( `calypso/components/social-icons/${ iconName }` );
				const IconComponent = module.default;
				setIconComponent( <IconComponent /> );
			} catch ( error ) {
				setIconComponent( null );
			}
		};

		getIconComponent( icon );
	}, [ icon ] );

	return <>{ IconComponent }</>;
}
