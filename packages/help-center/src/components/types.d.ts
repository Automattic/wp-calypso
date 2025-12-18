// context here: https://wp.me/pbAok1-1Ao
declare const __i18n_text_domain__: string;
interface Window {
	zE?: (
		action: string,
		value: string,
		handler?:
			| ( ( callback: ( data: string | number ) => void ) => void )
			| { id: number; value: string }[]
	) => void;
	_sva?: {
		invokeEvent?: ( eventName: string ) => void;
		addEventListener?: (
			eventName: string,
			callback: ( surveyId: string, surveyName: string ) => void
		) => void;
		removeEventListener?: (
			eventName: string,
			callback: ( surveyId: string, surveyName: string ) => void
		) => void;
		destroyVisitor?: () => void;
	};
}

declare module '*.jpg';
