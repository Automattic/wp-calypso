declare module 'calypso/components/data/document-head' {
	const DocumentHead: React.FC< {
		title?: string;
		skipTitleFormatting?: boolean;
		unreadCount?: number;
		link?: unknown[];
		meta?: unknown[];
		setTitle?: ( title: string ) => void;
		setLink?: ( link: unknown[] ) => void;
		setMeta?: ( meta: unknown[] ) => void;
		setUnreadCount?: ( unreadCount: number ) => void;
	} >;
	export default DocumentHead;
}

declare module 'calypso/components/formatted-header' {
	const FormattedHeader: React.FC< {
		id?: string;
		className?: string;
		brandFont?: boolean;
		headerText?: React.ReactNode;
		subHeaderText?: React.ReactNode;
		tooltipText?: React.ReactNode;
		compactOnMobile?: boolean;
		isSecondary?: boolean;
		align?: 'center' | 'left' | 'right';
		hasScreenOptions?: boolean;
		children?: React.ReactNode;
	} >;
	export default FormattedHeader;
}

declare module 'calypso/components/main' {
	const Main: React.FC< {
		className?: string;
		id?: string;
		children?: React.ReactNode;
		wideLayout?: boolean;
		fullWidthLayout?: boolean;
		isLoggedOut?: boolean;
	} >;
	export default Main;
}
