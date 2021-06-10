export type CallbackEventType = MouseEvent | KeyboardEvent;
export type DelegateEventHandlerType = 'click' | 'keyup';

export interface DelegateEventHandler {
	id: string;
	selector: string | ( ( event: CallbackEventType ) => boolean );
	type: DelegateEventHandlerType;
	capture?: boolean;
	handler: DelegateEventHandlerCallback;
}

export interface DelegateEventHandlerCallback {
	( event: CallbackEventType, target: EventTarget ): void;
}

export interface DelegateEventSubscriberCallback {
	( mapping: DelegateEventHandler, event: CallbackEventType, target: EventTarget ): void;
}

export type DelegateEventSubscriberType = 'before' | 'after';
