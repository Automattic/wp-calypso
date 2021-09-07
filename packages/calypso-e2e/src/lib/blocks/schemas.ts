export interface BlockComponent {
	blockName: string;
	configure(): Promise< void >;
	validateAfterPublish(): Promise< void >;
}
