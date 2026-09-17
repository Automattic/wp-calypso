// Bundled design fixtures so previews and downloads also work in review builds.
export const sampleDocuments: Record< string, { url: string; pages: string[] } > = {
	'sample-01': {
		url: new URL( './sample-assets/sample-01.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-01-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-01-2.png', import.meta.url ).href,
		],
	},
	'sample-03': {
		url: new URL( './sample-assets/sample-03.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-03-1.png', import.meta.url ).href ],
	},
	'sample-04': {
		url: new URL( './sample-assets/sample-04.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-04-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-04-2.png', import.meta.url ).href,
			new URL( './sample-assets/sample-04-3.png', import.meta.url ).href,
			new URL( './sample-assets/sample-04-4.png', import.meta.url ).href,
		],
	},
	'sample-05': {
		url: new URL( './sample-assets/sample-05.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-05-1.png', import.meta.url ).href ],
	},
	'sample-07': {
		url: new URL( './sample-assets/sample-07.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-07-1.png', import.meta.url ).href ],
	},
	'sample-08': {
		url: new URL( './sample-assets/sample-08.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-08-1.png', import.meta.url ).href ],
	},
	'sample-10': {
		url: new URL( './sample-assets/sample-10.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-10-1.png', import.meta.url ).href ],
	},
	'sample-11': {
		url: new URL( './sample-assets/sample-11.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-11-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-11-2.png', import.meta.url ).href,
			new URL( './sample-assets/sample-11-3.png', import.meta.url ).href,
			new URL( './sample-assets/sample-11-4.png', import.meta.url ).href,
		],
	},
	'sample-12': {
		url: new URL( './sample-assets/sample-12.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-12-1.png', import.meta.url ).href ],
	},
	'sample-14': {
		url: new URL( './sample-assets/sample-14.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-14-1.png', import.meta.url ).href ],
	},
	'sample-15': {
		url: new URL( './sample-assets/sample-15.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-15-1.png', import.meta.url ).href ],
	},
	'sample-16': {
		url: new URL( './sample-assets/sample-16.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-16-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-16-2.png', import.meta.url ).href,
		],
	},
	'sample-17': {
		url: new URL( './sample-assets/sample-17.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-17-1.png', import.meta.url ).href ],
	},
	'sample-18': {
		url: new URL( './sample-assets/sample-18.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-18-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-18-2.png', import.meta.url ).href,
			new URL( './sample-assets/sample-18-3.png', import.meta.url ).href,
			new URL( './sample-assets/sample-18-4.png', import.meta.url ).href,
		],
	},
	'sample-19': {
		url: new URL( './sample-assets/sample-19.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-19-1.png', import.meta.url ).href ],
	},
	'sample-21': {
		url: new URL( './sample-assets/sample-21.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-21-1.png', import.meta.url ).href ],
	},
	'sample-22': {
		url: new URL( './sample-assets/sample-22.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-22-1.png', import.meta.url ).href ],
	},
	'sample-23': {
		url: new URL( './sample-assets/sample-23.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-23-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-23-2.png', import.meta.url ).href,
		],
	},
	'sample-25': {
		url: new URL( './sample-assets/sample-25.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-25-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-25-2.png', import.meta.url ).href,
			new URL( './sample-assets/sample-25-3.png', import.meta.url ).href,
			new URL( './sample-assets/sample-25-4.png', import.meta.url ).href,
		],
	},
	'sample-26': {
		url: new URL( './sample-assets/sample-26.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-26-1.png', import.meta.url ).href ],
	},
	'sample-28': {
		url: new URL( './sample-assets/sample-28.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-28-1.png', import.meta.url ).href ],
	},
	'sample-29': {
		url: new URL( './sample-assets/sample-29.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-29-1.png', import.meta.url ).href ],
	},
	'sample-30': {
		url: new URL( './sample-assets/sample-30.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-30-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-30-2.png', import.meta.url ).href,
		],
	},
	'sample-32': {
		url: new URL( './sample-assets/sample-32.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-32-1.png', import.meta.url ).href ],
	},
	'sample-33': {
		url: new URL( './sample-assets/sample-33.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-33-1.png', import.meta.url ).href ],
	},
	'sample-35': {
		url: new URL( './sample-assets/sample-35.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-35-1.png', import.meta.url ).href ],
	},
	'sample-36': {
		url: new URL( './sample-assets/sample-36.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-36-1.png', import.meta.url ).href ],
	},
	'sample-37': {
		url: new URL( './sample-assets/sample-37.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-37-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-37-2.png', import.meta.url ).href,
		],
	},
	'sample-39': {
		url: new URL( './sample-assets/sample-39.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-39-1.png', import.meta.url ).href ],
	},
	'sample-40': {
		url: new URL( './sample-assets/sample-40.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-40-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-40-2.png', import.meta.url ).href,
			new URL( './sample-assets/sample-40-3.png', import.meta.url ).href,
			new URL( './sample-assets/sample-40-4.png', import.meta.url ).href,
		],
	},
	'sample-42': {
		url: new URL( './sample-assets/sample-42.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-42-1.png', import.meta.url ).href ],
	},
	'sample-43': {
		url: new URL( './sample-assets/sample-43.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-43-1.png', import.meta.url ).href ],
	},
	'sample-44': {
		url: new URL( './sample-assets/sample-44.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-44-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-44-2.png', import.meta.url ).href,
		],
	},
	'sample-46': {
		url: new URL( './sample-assets/sample-46.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-46-1.png', import.meta.url ).href ],
	},
	'sample-47': {
		url: new URL( './sample-assets/sample-47.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-47-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-47-2.png', import.meta.url ).href,
			new URL( './sample-assets/sample-47-3.png', import.meta.url ).href,
			new URL( './sample-assets/sample-47-4.png', import.meta.url ).href,
		],
	},
	'sample-48': {
		url: new URL( './sample-assets/sample-48.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-48-1.png', import.meta.url ).href ],
	},
	'sample-49': {
		url: new URL( './sample-assets/sample-49.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-49-1.png', import.meta.url ).href ],
	},
	'sample-50': {
		url: new URL( './sample-assets/sample-50.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-50-1.png', import.meta.url ).href ],
	},
	'sample-51': {
		url: new URL( './sample-assets/sample-51.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-51-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-51-2.png', import.meta.url ).href,
		],
	},
	'sample-53': {
		url: new URL( './sample-assets/sample-53.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-53-1.png', import.meta.url ).href ],
	},
	'sample-54': {
		url: new URL( './sample-assets/sample-54.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-54-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-54-2.png', import.meta.url ).href,
			new URL( './sample-assets/sample-54-3.png', import.meta.url ).href,
			new URL( './sample-assets/sample-54-4.png', import.meta.url ).href,
		],
	},
	'sample-55': {
		url: new URL( './sample-assets/sample-55.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-55-1.png', import.meta.url ).href ],
	},
	'sample-57': {
		url: new URL( './sample-assets/sample-57.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-57-1.png', import.meta.url ).href ],
	},
	'sample-58': {
		url: new URL( './sample-assets/sample-58.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-58-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-58-2.png', import.meta.url ).href,
		],
	},
	'sample-60': {
		url: new URL( './sample-assets/sample-60.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-60-1.png', import.meta.url ).href ],
	},
	'sample-61': {
		url: new URL( './sample-assets/sample-61.pdf', import.meta.url ).href,
		pages: [
			new URL( './sample-assets/sample-61-1.png', import.meta.url ).href,
			new URL( './sample-assets/sample-61-2.png', import.meta.url ).href,
			new URL( './sample-assets/sample-61-3.png', import.meta.url ).href,
			new URL( './sample-assets/sample-61-4.png', import.meta.url ).href,
		],
	},
	'sample-62': {
		url: new URL( './sample-assets/sample-62.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-62-1.png', import.meta.url ).href ],
	},
	'sample-64': {
		url: new URL( './sample-assets/sample-64.pdf', import.meta.url ).href,
		pages: [ new URL( './sample-assets/sample-64-1.png', import.meta.url ).href ],
	},
};
