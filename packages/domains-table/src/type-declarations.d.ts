declare const __i18n_text_domain__: string;

declare module '*.svg' {
	const url: string;
	export default url;
}

declare module 'calypso/components/notice';

declare module 'calypso/lib/wp';

declare module 'calypso/lib/accept/dialog' {
	import { ReactNode } from 'react';

	interface AcceptDialogProps {
		message: ReactNode;
		onClose: ( accepted: boolean ) => void;
		confirmButtonText?: ReactNode;
		cancelButtonText?: ReactNode;
		options?: {
			isScary?: boolean;
			additionalClassNames?: string;
			useModal?: boolean;
			modalOptions?: {
				title?: ReactNode;
			};
		};
	}

	const AcceptDialog: React.FC< AcceptDialogProps >;
	export default AcceptDialog;
}
