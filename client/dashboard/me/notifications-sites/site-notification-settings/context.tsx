import { type Site } from '@automattic/api-core';
import { createContext, useContext } from 'react';

const context = createContext< Site | null >( null );

export const SiteNotificationSettingsContext = context;

interface Props extends React.PropsWithChildren {
	value: Site;
}

export const SiteNotificationSettingsProvider = ( { value, children }: Props ) => {
	return <context.Provider value={ value }>{ children }</context.Provider>;
};

export const useSiteNotificationSettingsContext = () => useContext( context );
