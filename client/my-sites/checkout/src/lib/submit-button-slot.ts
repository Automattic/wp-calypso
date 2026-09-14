import { createContext, useContext } from 'react';

interface SubmitButtonSlot {
	slotEl: HTMLElement | null;
	setSlotEl: ( el: HTMLElement | null ) => void;
}

export const SubmitButtonSlotContext = createContext< SubmitButtonSlot >( {
	slotEl: null,
	setSlotEl: () => undefined,
} );

export function useSubmitButtonSlot(): SubmitButtonSlot {
	return useContext( SubmitButtonSlotContext );
}
