import { createContext, useContext, ReactNode, useState } from 'react';

export type TabType = 'mobile' | 'desktop';

interface DeviceTabContextType {
	activeTab: TabType;
	setActiveTab: ( tab: TabType ) => void;
}

const DeviceTabContext = createContext< DeviceTabContextType >( {
	activeTab: 'mobile',
	setActiveTab: () => undefined,
} );

export function DeviceTabProvider( {
	initialTab = 'mobile',
	children,
}: {
	initialTab?: TabType;
	children: ReactNode;
} ) {
	const [ activeTab, setActiveTab ] = useState< TabType >( initialTab );

	return (
		<DeviceTabContext.Provider value={ { activeTab, setActiveTab } }>
			{ children }
		</DeviceTabContext.Provider>
	);
}

export function useDeviceTab() {
	const context = useContext( DeviceTabContext );
	if ( ! context ) {
		throw new Error( 'useDeviceTab must be used within a DeviceTabProvider' );
	}
	return context;
}
