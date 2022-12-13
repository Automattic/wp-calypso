import { useEffect, useReducer } from 'react';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
export type CartSubscriberProps = {
	siteId: number | null;
	render: () => JSX.Element;
};
export default function ( { siteId, render }: CartSubscriberProps ) {
	//simulate forceUpdate to manually trigger re-render on cart changes
	/* eslint-disable  @typescript-eslint/no-unused-vars */
	const [ ignored, forceUpdate ] = useReducer( ( x ) => x + 1, 0 );
	useEffect( () => {
		const manager = cartManagerClient.forCartKey( siteId || undefined );
		const unsubscribe = manager.subscribe( () => forceUpdate() );
		manager.actions.reloadFromServer();

		return unsubscribe;
	}, [ siteId ] );
	return <>{ render() }</>;
}
