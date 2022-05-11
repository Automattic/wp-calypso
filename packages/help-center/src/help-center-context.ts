import React, { ReactNode } from 'react';
import { Article } from './types';

export const HelpCenterContext = React.createContext< {
	headerText: ReactNode;
	setHeaderText: ( newHeaderText: ReactNode ) => void;
	footerContent: ReactNode;
	setFooterContent: ( content: ReactNode ) => void;
	selectedArticle?: Article | null;
	setSelectedArticle: ( article: Article ) => void;
} >( {
	headerText: '',
	footerContent: null,
	selectedArticle: null,
	setHeaderText( text ) {
		return text;
	},
	setFooterContent() {
		return;
	},
	setSelectedArticle() {
		return;
	},
} );
