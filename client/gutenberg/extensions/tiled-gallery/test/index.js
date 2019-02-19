/** @jest-environment jsdom */
/**
 * Internal dependencies
 */
import { name, settings } from '..';
import { blockSave } from 'gutenberg/extensions/test/utils';

test( 'serializes as expected', () => {
	// Yes, atributess is plural of attributes ;)
	const attributess = [
		{
			align: 'center',
			className: 'is-style-rectangular',
			ids: [ 279, 282, 281 ],
			images: [
				{
					alt: '',
					id: 279,
					link: 'https://example.wordpress.com/pexels-photo-1530259/',
					url: 'https://example.files.wordpress.com/2018/12/pexels-photo-1530259.jpeg?w=640',
					height: 1300,
					width: 867,
				},
				{
					alt: '',
					id: 282,
					link: 'https://example.wordpress.com/pexels-photo-587839/',
					url: 'https://example.files.wordpress.com/2018/12/pexels-photo-587839.jpeg?w=640',
					height: 1251,
					width: 1880,
				},
				{
					alt: '',
					id: 281,
					link: 'https://example.wordpress.com/eiffel-tower-paris-france-tower-60027/',
					url:
						'https://example.files.wordpress.com/2018/12/eiffel-tower-paris-france-tower-60027.jpeg?w=640',
					height: 1300,
					width: 870,
				},
			],
			linkTo: 'none',
			columns: 2,
		},
		{
			align: 'center',
			className: 'is-style-square',
			ids: [ 279, 282, 281 ],
			images: [
				{
					alt: '',
					id: 279,
					link: 'https://example.wordpress.com/pexels-photo-1530259/',
					url: 'https://example.files.wordpress.com/2018/12/pexels-photo-1530259.jpeg?w=640',
					height: 1300,
					width: 867,
				},
				{
					alt: '',
					id: 282,
					link: 'https://example.wordpress.com/pexels-photo-587839/',
					url: 'https://example.files.wordpress.com/2018/12/pexels-photo-587839.jpeg?w=640',
					height: 1251,
					width: 1880,
				},
				{
					alt: '',
					id: 281,
					link: 'https://example.wordpress.com/eiffel-tower-paris-france-tower-60027/',
					url:
						'https://example.files.wordpress.com/2018/12/eiffel-tower-paris-france-tower-60027.jpeg?w=640',
					height: 1300,
					width: 870,
				},
			],
			linkTo: 'none',
			columns: 3,
		},
		{
			align: 'center',
			className: 'is-style-columns',
			ids: [ 279, 282, 281 ],
			images: [
				{
					alt: '',
					id: 279,
					link: 'https://example.wordpress.com/pexels-photo-1530259/',
					url: 'https://example.files.wordpress.com/2018/12/pexels-photo-1530259.jpeg?w=640',
					height: 1300,
					width: 867,
				},
				{
					alt: '',
					id: 282,
					link: 'https://example.wordpress.com/pexels-photo-587839/',
					url: 'https://example.files.wordpress.com/2018/12/pexels-photo-587839.jpeg?w=640',
					height: 1251,
					width: 1880,
				},
				{
					alt: '',
					id: 281,
					link: 'https://example.wordpress.com/eiffel-tower-paris-france-tower-60027/',
					url:
						'https://example.files.wordpress.com/2018/12/eiffel-tower-paris-france-tower-60027.jpeg?w=640',
					height: 1300,
					width: 870,
				},
			],
			linkTo: 'attachment',
			columns: 2,
		},
	];

	attributess.forEach( attributes =>
		expect( blockSave( name, settings, attributes ) ).toMatchSnapshot()
	);
} );
