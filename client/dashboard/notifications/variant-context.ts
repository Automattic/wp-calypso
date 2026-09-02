import { createContext, useContext } from 'react';
import type { InboxVariant } from './variants';

/*
 * The active detail variant's context, separate from the registry so base
 * views can read it without importing the variant implementations (the
 * registry imports them, and they import the base views back).
 */
export const InboxVariantContext = createContext< InboxVariant >( { key: 'default', label: '' } );

export const InboxVariantProvider = InboxVariantContext.Provider;

export function useInboxVariant(): InboxVariant {
	return useContext( InboxVariantContext );
}
