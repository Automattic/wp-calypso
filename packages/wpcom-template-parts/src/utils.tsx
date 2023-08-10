import { translate as translateMethod } from 'i18n-calypso';

export const getAutomatticBrandingNoun = ( translate: typeof translateMethod ) => {
	const automatticRoger = [
		translate( 'An {{Automattic/}} brainchild', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} contraption', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} creation', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} experiment', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} invention', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} joint', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} medley', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} opus', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} production', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} ruckus', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} thingamajig', {
			components: { Automattic: <AutomatticBrand /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
	];

	const branding = automatticRoger[ Math.floor( Math.random() * ( 10 - 0 + 1 ) + 0 ) ];

	return branding;
};

export function AutomatticBrand() {
	return (
		<>
			<span className="lp-hidden">Automattic</span>
			<svg
				className="lp-icon lp-icon--custom-automattic-footer"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 126 11"
				aria-hidden="true"
			>
				<path d="M121 .68c1.9 0 3.62.82 4.55 1.86l-1.05 1.1c-.81-.77-2-1.5-3.6-1.5-2.4 0-3.75 1.71-3.75 3.48v.19c0 1.76 1.36 3.4 3.87 3.4 1.5 0 2.74-.74 3.52-1.5l1.01 1.11a6.58 6.58 0 0 1-4.64 1.86c-3.4 0-5.46-2.29-5.46-4.8v-.31c0-2.52 2.25-4.89 5.54-4.89zm-104.64.34v5.46c0 1.71 1.09 2.73 3.17 2.73 2.13 0 3-1.02 3-2.73V1.02h1.69v5.43c0 2.3-1.43 4.23-4.82 4.23-3.22 0-4.72-1.82-4.72-4.23V1h1.68zM45.88.68c3.2 0 5.25 2.33 5.25 4.85v.3c0 2.48-2.06 4.85-5.26 4.85-3.18 0-5.24-2.37-5.24-4.85v-.3C40.63 3 42.69.68 45.88.68zm-8.35.34v1.45H33.6v7.85h-1.68V2.47h-3.93V1.02h9.54zm20.12 0 3.54 6.38.42.78.42-.78 3.5-6.4h2.31v9.3h-1.68V2.97l-.45.8-3.76 6.56h-.82L57.4 3.77l-.45-.81v7.36h-1.64v-9.3h2.33zm35.47 0v1.45h-3.93v7.85h-1.68V2.47h-3.93V1.02h9.54zm12.36 0v1.45h-3.92v7.85h-1.69V2.47h-3.92V1.02h9.53zm5.82 0v9.3h-1.66V1.89c.67 0 .94-.37.94-.88h.72zm-104.5 0 4.94 9.3h-1.8l-1.19-2.3H3.48l-1.15 2.3H.55l4.86-9.3h1.4zm70.66 0 4.93 9.3h-1.8l-1.19-2.3h-5.27l-1.15 2.3H71.2l4.86-9.3h1.4zM45.88 2.15c-2.3 0-3.55 1.6-3.55 3.4v.23c0 1.8 1.25 3.43 3.55 3.43 2.29 0 3.56-1.63 3.56-3.43v-.23c0-1.8-1.27-3.4-3.56-3.4zm1.1 1.77a.7.7 0 0 1 .2.94l-1.54 2.46a.64.64 0 0 1-.9.2.7.7 0 0 1-.2-.93l1.54-2.47a.64.64 0 0 1 .9-.2zM6.08 2.83 4.1 6.74h3.98l-2.02-3.9zm70.65 0-1.96 3.91h3.98l-2.02-3.9z"></path>
			</svg>
		</>
	);
}
