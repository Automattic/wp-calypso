export type SubscriptionManagerCallback = () => void;
export type SubscriptionManagerUnsubscribe = () => void;

export class SubscriptionManager {
	subscribers: SubscriptionManagerCallback[];

	constructor() {
		this.subscribers = [];
	}

	subscribe = ( callback: SubscriptionManagerCallback ): SubscriptionManagerUnsubscribe => {
		this.subscribers.push( callback );
		return () => {
			this.subscribers = this.subscribers.filter( ( client ) => client !== callback );
		};
	};

	notifySubscribers = () => {
		this.subscribers.forEach( ( callback ) => callback() );
	};
}
