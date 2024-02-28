export interface useCommandsParams {
	setSelectedCommandName: ( name: string ) => void;
	navigate: ( path: string, openInNewTab?: boolean ) => void;
	currentRoute: string | null;
}
