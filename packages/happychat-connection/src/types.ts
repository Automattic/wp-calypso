export interface User {
	ID: number;
	language: string;
}

export interface GeoLocation {
	country_short: string;
	country_long: string;
	region: string;
	city: string;
}

export interface HappychatSession {
	session_id: number;
	geo_location: GeoLocation;
}

export interface HappychatUser {
	signer_user_id: number;
	groups?: string[];
	skills?: {
		product: string[];
		language: string[];
	};
	geoLocation?: GeoLocation;
}

export interface ConnectionProps {
	receiveAccept?: ( accept: boolean ) => void;
	receiveConnect?: () => void;
	receiveDisconnect?: ( reason: string ) => void;
	receiveError?: ( error: string ) => void;
	receiveInit?: ( init: HappychatUser ) => void;
	receiveLocalizedSupport?: ( accept: boolean ) => void;
	receiveMessage?: ( message: string ) => void;
	receiveMessageOptimistic?: ( message: string ) => void;
	receiveMessageUpdate?: ( message: string ) => void;
	receiveReconnecting?: () => void;
	receiveStatus?: ( status: string ) => void;
	receiveToken?: () => void;
	receiveUnauthorized?: ( message: string ) => void;
	requestTranscript?: () => void;
}

export interface AvailabilityConnectionProps {
	receiveAccept?: ( accept: boolean ) => void;
	receiveUnauthorized?: ( message: string ) => void;
	receiveStatus?: ( status: string ) => void;
}

export interface HappychatAuth {
	url: string | Socket;
	user: {
		jwt: string;
	} & HappychatUser;
	fullUser: User;
}

export interface Action {
	event: string;
	payload: object;
	callback?: any;
}

export interface Socket {
	once: ( event: string, callback: ( data: any ) => void ) => Socket;
	on: ( event: string, callback: ( data: any ) => void ) => Socket;
	emit: ( event: string, data: any, callback?: any ) => Socket;
	close: () => void;
	io: {
		opts: {
			transports: string[];
		};
	};
}
