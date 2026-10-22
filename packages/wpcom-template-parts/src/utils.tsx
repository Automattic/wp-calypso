import { translate as translateMethod } from 'i18n-calypso';

export const getAutomatticBrandingNoun = (
	translate: typeof translateMethod,
	redesigned = false
) => {
	const automatticRoger = [
		translate( 'An {{Automattic/}} brainchild', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} contraption', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} creation', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} experiment', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} invention', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} joint', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} medley', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} opus', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} production', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} ruckus', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
		translate( 'An {{Automattic/}} thingamajig', {
			components: { Automattic: <AutomatticBrand redesigned={ redesigned } /> },
			comment:
				'Branding to be shown on the Footer of the page, Automattic\'s variable will always contains the word "Automattic"',
		} ),
	];

	const branding = automatticRoger[ Math.floor( Math.random() * ( 10 - 0 + 1 ) + 0 ) ];

	return branding;
};

export function AutomatticBrand( { redesigned = false }: { redesigned?: boolean } ) {
	return (
		<>
			<span className="lp-hidden">Automattic</span>
			<svg
				className="lp-icon lp-icon--custom-automattic-footer lp-color-primary"
				xmlns="http://www.w3.org/2000/svg"
				viewBox={ redesigned ? '0 0 143 12' : '0 0 126 11' }
				aria-hidden="true"
			>
				<path
					d={
						redesigned
							? 'M53.01 4.19a.749.749 0 0 0-1.033.226L50.225 7.13a.748.748 0 0 0 .219 1.035.748.748 0 0 0 1.033-.226l1.752-2.713a.748.748 0 0 0-.219-1.035Zm88.303-.303c-.922-.845-2.274-1.644-4.102-1.644-2.735 0-4.272 1.874-4.272 3.826v.2c0 1.935 1.552 3.748 4.41 3.748 1.705 0 3.118-.814 4.01-1.644l1.152 1.214c-1.122 1.106-3.027 2.043-5.285 2.043-3.872 0-6.222-2.52-6.222-5.285v-.338c0-2.765 2.565-5.377 6.314-5.377 2.166 0 4.133.906 5.193 2.043l-1.198 1.214Zm-16.931 7.343V1.967c.768 0 1.076-.415 1.076-.968h.814V11.23h-1.89Zm-9.202-8.633v8.633h-1.92V2.597h-4.471V.999h10.862v1.598h-4.471Zm-14.088 0v8.633h-1.92V2.597H94.7V.999h10.862v1.598h-4.471Zm-14.21.399-2.228 4.302h4.532L86.88 2.996Zm4.408 8.234-1.352-2.534h-6.007l-1.306 2.534h-2.028L86.128 1h1.598l5.623 10.231H91.29Zm-16.438 0V3.134l-.507.891-4.287 7.205h-.937l-4.24-7.205-.507-.89v8.095H62.5V1h2.657l4.04 7.02.477.86.477-.86L74.145 1h2.627V11.23h-1.92ZM37.765 2.597v8.633h-1.92V2.597h-4.471V.999h10.862v1.598h-4.471ZM21.587 11.63c-3.671 0-5.377-1.997-5.377-4.655V.999h1.905v6.007c0 1.89 1.245 3.01 3.61 3.01 2.428 0 3.427-1.12 3.427-3.01V.999h1.92v5.976c0 2.535-1.628 4.655-5.485 4.655ZM6.394 2.996 4.166 7.298h4.532L6.394 2.996Zm4.409 8.234L9.45 8.696H3.444L2.138 11.23H.11L5.64 1H7.24L12.86 11.23h-2.058ZM55.8 5.992c0-1.982-1.444-3.75-4.056-3.75-2.611 0-4.04 1.768-4.04 3.75v.245c0 1.982 1.429 3.78 4.04 3.78 2.612 0 4.056-1.798 4.056-3.78v-.245Zm-4.056 5.638c-3.626 0-5.976-2.612-5.976-5.331V5.96c0-2.766 2.35-5.331 5.976-5.331 3.642 0 5.992 2.565 5.992 5.331V6.3c0 2.72-2.35 5.331-5.992 5.331Z'
							: 'M121 .68c1.9 0 3.62.82 4.55 1.86l-1.05 1.1c-.81-.77-2-1.5-3.6-1.5-2.4 0-3.75 1.71-3.75 3.48v.19c0 1.76 1.36 3.4 3.87 3.4 1.5 0 2.74-.74 3.52-1.5l1.01 1.11a6.58 6.58 0 0 1-4.64 1.86c-3.4 0-5.46-2.29-5.46-4.8v-.31c0-2.52 2.25-4.89 5.54-4.89zm-104.64.34v5.46c0 1.71 1.09 2.73 3.17 2.73 2.13 0 3-1.02 3-2.73V1.02h1.69v5.43c0 2.3-1.43 4.23-4.82 4.23-3.22 0-4.72-1.82-4.72-4.23V1h1.68zM45.88.68c3.2 0 5.25 2.33 5.25 4.85v.3c0 2.48-2.06 4.85-5.26 4.85-3.18 0-5.24-2.37-5.24-4.85v-.3C40.63 3 42.69.68 45.88.68zm-8.35.34v1.45H33.6v7.85h-1.68V2.47h-3.93V1.02h9.54zm20.12 0 3.54 6.38.42.78.42-.78 3.5-6.4h2.31v9.3h-1.68V2.97l-.45.8-3.76 6.56h-.82L57.4 3.77l-.45-.81v7.36h-1.64v-9.3h2.33zm35.47 0v1.45h-3.93v7.85h-1.68V2.47h-3.93V1.02h9.54zm12.36 0v1.45h-3.92v7.85h-1.69V2.47h-3.92V1.02h9.53zm5.82 0v9.3h-1.66V1.89c.67 0 .94-.37.94-.88h.72zm-104.5 0 4.94 9.3h-1.8l-1.19-2.3H3.48l-1.15 2.3H.55l4.86-9.3h1.4zm70.66 0 4.93 9.3h-1.8l-1.19-2.3h-5.27l-1.15 2.3H71.2l4.86-9.3h1.4zM45.88 2.15c-2.3 0-3.55 1.6-3.55 3.4v.23c0 1.8 1.25 3.43 3.55 3.43 2.29 0 3.56-1.63 3.56-3.43v-.23c0-1.8-1.27-3.4-3.56-3.4zm1.1 1.77a.7.7 0 0 1 .2.94l-1.54 2.46a.64.64 0 0 1-.9.2.7.7 0 0 1-.2-.93l1.54-2.47a.64.64 0 0 1 .9-.2zM6.08 2.83 4.1 6.74h3.98l-2.02-3.9zm70.65 0-1.96 3.91h3.98l-2.02-3.9z'
					}
				></path>
			</svg>
		</>
	);
}
