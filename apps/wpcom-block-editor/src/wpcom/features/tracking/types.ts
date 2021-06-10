export type DelegateEventHandlerType = 'click' | 'keyup';

export interface DelegateEventHandler {
	id: string;
	selector: string;
	type: DelegateEventHandlerType;
}

export interface DelegateEventHandlerCallback {
	( event: MouseEvent | KeyboardEvent, target: EventTarget ): void;
}

export interface DelegateEventSubscriberCallback {
	( mapping: DelegateEventHandler, event: MouseEvent | KeyboardEvent, target: EventTarget ): void;
}

export type DelegateEventSubscriberType = 'before' | 'after';
