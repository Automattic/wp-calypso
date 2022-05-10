import React, { ReactNode } from 'react';

export const HelpCenterContext = React.createContext< {
	headerText: ReactNode;
	setHeaderText: ( newHeaderText: ReactNode ) => void;
	footerContent: ReactNode;
	setFooterContent: ( content: ReactNode ) => void;
} >( {
	headerText: '',
	footerContent: null,
	setHeaderText( text ) {
		return text;
	},
	setFooterContent() {
		return;
	},
} );
