import { Design } from '../../../types';

export const nonPremiumDesign: Design = {
	slug: 'twentytwentyfour',
	title: 'Twenty Twenty-Four',
	description:
		'Twenty Twenty-Four is designed to be flexible, versatile and applicable to any website.',
	recipe: {
		stylesheet: 'pub/twentytwentyfour',
	},
	categories: [
		{
			slug: 'business',
			name: 'Business',
		},
		{
			slug: 'portfolio',
			name: 'Portfolio',
		},
	],
	is_premium: false,
	is_externally_managed: false,
	is_bundled_with_woo: false,
	software_sets: [],
	design_type: 'standard',
	style_variations: [
		{
			slug: 'default',
			title: 'Default',
			settings: {
				color: {
					background: true,
					button: true,
					caption: true,
					custom: true,
					customDuotone: true,
					customGradient: true,
					defaultDuotone: false,
					defaultGradients: false,
					defaultPalette: false,
					duotone: {
						default: [
							{
								name: 'Dark grayscale',
								colors: [ '#000000', '#7f7f7f' ],
								slug: 'dark-grayscale',
							},
							{
								name: 'Grayscale',
								colors: [ '#000000', '#ffffff' ],
								slug: 'grayscale',
							},
							{
								name: 'Purple and yellow',
								colors: [ '#8c00b7', '#fcff41' ],
								slug: 'purple-yellow',
							},
							{
								name: 'Blue and red',
								colors: [ '#000097', '#ff4747' ],
								slug: 'blue-red',
							},
							{
								name: 'Midnight',
								colors: [ '#000000', '#00a5ff' ],
								slug: 'midnight',
							},
							{
								name: 'Magenta and yellow',
								colors: [ '#c7005a', '#fff278' ],
								slug: 'magenta-yellow',
							},
							{
								name: 'Purple and green',
								colors: [ '#a60072', '#67ff66' ],
								slug: 'purple-green',
							},
							{
								name: 'Blue and orange',
								colors: [ '#1900d8', '#ffa96b' ],
								slug: 'blue-orange',
							},
						],
						theme: [
							{
								colors: [ '#111111', '#ffffff' ],
								slug: 'duotone-1',
								name: 'Black and white',
							},
							{
								colors: [ '#111111', '#C2A990' ],
								slug: 'duotone-2',
								name: 'Black and sandstone',
							},
							{
								colors: [ '#111111', '#D8613C' ],
								slug: 'duotone-3',
								name: 'Black and rust',
							},
							{
								colors: [ '#111111', '#B1C5A4' ],
								slug: 'duotone-4',
								name: 'Black and sage',
							},
							{
								colors: [ '#111111', '#B5BDBC' ],
								slug: 'duotone-5',
								name: 'Black and pastel blue',
							},
						],
					},
					gradients: {
						default: [
							{
								name: 'Vivid cyan blue to vivid purple',
								gradient: 'linear-gradient(135deg,rgba(6,147,227,1) 0%,rgb(155,81,224) 100%)',
								slug: 'vivid-cyan-blue-to-vivid-purple',
							},
							{
								name: 'Light green cyan to vivid green cyan',
								gradient: 'linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%)',
								slug: 'light-green-cyan-to-vivid-green-cyan',
							},
							{
								name: 'Luminous vivid amber to luminous vivid orange',
								gradient: 'linear-gradient(135deg,rgba(252,185,0,1) 0%,rgba(255,105,0,1) 100%)',
								slug: 'luminous-vivid-amber-to-luminous-vivid-orange',
							},
							{
								name: 'Luminous vivid orange to vivid red',
								gradient: 'linear-gradient(135deg,rgba(255,105,0,1) 0%,rgb(207,46,46) 100%)',
								slug: 'luminous-vivid-orange-to-vivid-red',
							},
							{
								name: 'Very light gray to cyan bluish gray',
								gradient: 'linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%)',
								slug: 'very-light-gray-to-cyan-bluish-gray',
							},
							{
								name: 'Cool to warm spectrum',
								gradient:
									'linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%)',
								slug: 'cool-to-warm-spectrum',
							},
							{
								name: 'Blush light purple',
								gradient: 'linear-gradient(135deg,rgb(255,206,236) 0%,rgb(152,150,240) 100%)',
								slug: 'blush-light-purple',
							},
							{
								name: 'Blush bordeaux',
								gradient:
									'linear-gradient(135deg,rgb(254,205,165) 0%,rgb(254,45,45) 50%,rgb(107,0,62) 100%)',
								slug: 'blush-bordeaux',
							},
							{
								name: 'Luminous dusk',
								gradient:
									'linear-gradient(135deg,rgb(255,203,112) 0%,rgb(199,81,192) 50%,rgb(65,88,208) 100%)',
								slug: 'luminous-dusk',
							},
							{
								name: 'Pale ocean',
								gradient:
									'linear-gradient(135deg,rgb(255,245,203) 0%,rgb(182,227,212) 50%,rgb(51,167,181) 100%)',
								slug: 'pale-ocean',
							},
							{
								name: 'Electric grass',
								gradient: 'linear-gradient(135deg,rgb(202,248,128) 0%,rgb(113,206,126) 100%)',
								slug: 'electric-grass',
							},
							{
								name: 'Midnight',
								gradient: 'linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%)',
								slug: 'midnight',
							},
						],
						theme: [
							{
								slug: 'gradient-1',
								gradient: 'linear-gradient(to bottom, #cfcabe 0%, #F9F9F9 100%)',
								name: 'Vertical soft beige to white',
							},
							{
								slug: 'gradient-2',
								gradient: 'linear-gradient(to bottom, #C2A990 0%, #F9F9F9 100%)',
								name: 'Vertical soft sandstone to white',
							},
							{
								slug: 'gradient-3',
								gradient: 'linear-gradient(to bottom, #D8613C 0%, #F9F9F9 100%)',
								name: 'Vertical soft rust to white',
							},
							{
								slug: 'gradient-4',
								gradient: 'linear-gradient(to bottom, #B1C5A4 0%, #F9F9F9 100%)',
								name: 'Vertical soft sage to white',
							},
							{
								slug: 'gradient-5',
								gradient: 'linear-gradient(to bottom, #B5BDBC 0%, #F9F9F9 100%)',
								name: 'Vertical soft mint to white',
							},
							{
								slug: 'gradient-6',
								gradient: 'linear-gradient(to bottom, #A4A4A4 0%, #F9F9F9 100%)',
								name: 'Vertical soft pewter to white',
							},
							{
								slug: 'gradient-7',
								gradient: 'linear-gradient(to bottom, #cfcabe 50%, #F9F9F9 50%)',
								name: 'Vertical hard beige to white',
							},
							{
								slug: 'gradient-8',
								gradient: 'linear-gradient(to bottom, #C2A990 50%, #F9F9F9 50%)',
								name: 'Vertical hard sandstone to white',
							},
							{
								slug: 'gradient-9',
								gradient: 'linear-gradient(to bottom, #D8613C 50%, #F9F9F9 50%)',
								name: 'Vertical hard rust to white',
							},
							{
								slug: 'gradient-10',
								gradient: 'linear-gradient(to bottom, #B1C5A4 50%, #F9F9F9 50%)',
								name: 'Vertical hard sage to white',
							},
							{
								slug: 'gradient-11',
								gradient: 'linear-gradient(to bottom, #B5BDBC 50%, #F9F9F9 50%)',
								name: 'Vertical hard mint to white',
							},
							{
								slug: 'gradient-12',
								gradient: 'linear-gradient(to bottom, #A4A4A4 50%, #F9F9F9 50%)',
								name: 'Vertical hard pewter to white',
							},
						],
					},
					heading: true,
					link: true,
					palette: {
						default: [
							{
								name: 'Black',
								slug: 'black',
								color: '#000000',
							},
							{
								name: 'Cyan bluish gray',
								slug: 'cyan-bluish-gray',
								color: '#abb8c3',
							},
							{
								name: 'White',
								slug: 'white',
								color: '#ffffff',
							},
							{
								name: 'Pale pink',
								slug: 'pale-pink',
								color: '#f78da7',
							},
							{
								name: 'Vivid red',
								slug: 'vivid-red',
								color: '#cf2e2e',
							},
							{
								name: 'Luminous vivid orange',
								slug: 'luminous-vivid-orange',
								color: '#ff6900',
							},
							{
								name: 'Luminous vivid amber',
								slug: 'luminous-vivid-amber',
								color: '#fcb900',
							},
							{
								name: 'Light green cyan',
								slug: 'light-green-cyan',
								color: '#7bdcb5',
							},
							{
								name: 'Vivid green cyan',
								slug: 'vivid-green-cyan',
								color: '#00d084',
							},
							{
								name: 'Pale cyan blue',
								slug: 'pale-cyan-blue',
								color: '#8ed1fc',
							},
							{
								name: 'Vivid cyan blue',
								slug: 'vivid-cyan-blue',
								color: '#0693e3',
							},
							{
								name: 'Vivid purple',
								slug: 'vivid-purple',
								color: '#9b51e0',
							},
						],
						theme: [
							{
								color: '#f9f9f9',
								name: 'Base',
								slug: 'base',
							},
							{
								color: '#ffffff',
								name: 'Base / Two',
								slug: 'base-2',
							},
							{
								color: '#111111',
								name: 'Contrast',
								slug: 'contrast',
							},
							{
								color: '#636363',
								name: 'Contrast / Two',
								slug: 'contrast-2',
							},
							{
								color: '#A4A4A4',
								name: 'Contrast / Three',
								slug: 'contrast-3',
							},
							{
								color: '#cfcabe',
								name: 'Accent',
								slug: 'accent',
							},
							{
								color: '#c2a990',
								name: 'Accent / Two',
								slug: 'accent-2',
							},
							{
								color: '#d8613c',
								name: 'Accent / Three',
								slug: 'accent-3',
							},
							{
								color: '#b1c5a4',
								name: 'Accent / Four',
								slug: 'accent-4',
							},
							{
								color: '#b5bdbc',
								name: 'Accent / Five',
								slug: 'accent-5',
							},
						],
					},
					text: true,
				},
			},
		},
		{
			slug: 'ember',
			title: 'Ember',
			settings: {
				color: {
					duotone: {
						theme: [
							{
								colors: [ '#FF3C00', '#F4F0E6' ],
								slug: 'duotone-2',
								name: 'Orange and white',
							},
						],
					},
					gradients: {
						theme: [
							{
								slug: 'gradient-1',
								gradient: 'linear-gradient(to bottom, #f6decd 0%, #dbab88 100%)',
								name: 'Vertical linen to beige',
							},
							{
								slug: 'gradient-2',
								gradient: 'linear-gradient(to bottom, #A4A4A4 0%, #dbab88 100%)',
								name: 'Vertical taupe to beige',
							},
							{
								slug: 'gradient-3',
								gradient: 'linear-gradient(to bottom, #353535 0%, #dbab88 100%)',
								name: 'Vertical sable to beige',
							},
							{
								slug: 'gradient-4',
								gradient: 'linear-gradient(to bottom, #111111 0%, #dbab88 100%)',
								name: 'Vertical ebony to beige',
							},
							{
								slug: 'gradient-5',
								gradient: 'linear-gradient(to bottom, #353535 0%, #A4A4A4 100%)',
								name: 'Vertical sable to beige',
							},
							{
								slug: 'gradient-6',
								gradient: 'linear-gradient(to bottom, #111111 0%, #353535 100%)',
								name: 'Vertical ebony to sable',
							},
							{
								slug: 'gradient-7',
								gradient: 'linear-gradient(to bottom, #dbab88 50%, #f6decd 50%)',
								name: 'Vertical hard beige to linen',
							},
							{
								slug: 'gradient-8',
								gradient: 'linear-gradient(to bottom, #A4A4A4 50%, #dbab88 50%)',
								name: 'Vertical hard taupe to beige',
							},
							{
								slug: 'gradient-9',
								gradient: 'linear-gradient(to bottom, #353535 50%, #dbab88 50%)',
								name: 'Vertical hard sable to beige',
							},
							{
								slug: 'gradient-10',
								gradient: 'linear-gradient(to bottom, #111111 50%, #dbab88 50%)',
								name: 'Vertical hard ebony to beige',
							},
							{
								slug: 'gradient-11',
								gradient: 'linear-gradient(to bottom, #353535 50%, #A4A4A4 50%)',
								name: 'Vertical hard sable to taupe',
							},
							{
								slug: 'gradient-12',
								gradient: 'linear-gradient(to bottom, #111111 50%, #353535 50%)',
								name: 'Vertical hard ebony to sable',
							},
						],
					},
					palette: {
						theme: [
							{
								color: '#F4F0E6',
								name: 'Base',
								slug: 'base',
							},
							{
								color: '#FF3C00',
								name: 'Contrast / 2',
								slug: 'contrast-2',
							},
							{
								color: '#000',
								name: 'Contrast',
								slug: 'contrast',
							},
							{
								color: '#f6decd',
								name: 'Base / Two',
								slug: 'base-2',
							},
						],
					},
				},
			},
		},
		{
			slug: 'fossil',
			title: 'Fossil',
			settings: {
				color: {
					gradients: {
						theme: [
							{
								slug: 'gradient-1',
								gradient: 'linear-gradient(to bottom, #E1DFDB 0%, #D6D2CE 100%)',
								name: 'Vertical linen to beige',
							},
							{
								slug: 'gradient-2',
								gradient: 'linear-gradient(to bottom, #958D86 0%, #D6D2CE 100%)',
								name: 'Vertical taupe to beige',
							},
							{
								slug: 'gradient-3',
								gradient: 'linear-gradient(to bottom, #65574E 0%, #D6D2CE 100%)',
								name: 'Vertical sable to beige',
							},
							{
								slug: 'gradient-4',
								gradient: 'linear-gradient(to bottom, #1A1514 0%, #D6D2CE 100%)',
								name: 'Vertical ebony to beige',
							},
							{
								slug: 'gradient-5',
								gradient: 'linear-gradient(to bottom, #65574E 0%, #958D86 100%)',
								name: 'Vertical sable to beige',
							},
							{
								slug: 'gradient-6',
								gradient: 'linear-gradient(to bottom, #1A1514 0%, #65574E 100%)',
								name: 'Vertical ebony to sable',
							},
							{
								slug: 'gradient-7',
								gradient: 'linear-gradient(to bottom, #D6D2CE 50%, #E1DFDB 50%)',
								name: 'Vertical hard beige to linen',
							},
							{
								slug: 'gradient-8',
								gradient: 'linear-gradient(to bottom, #958D86 50%, #D6D2CE 50%)',
								name: 'Vertical hard taupe to beige',
							},
							{
								slug: 'gradient-9',
								gradient: 'linear-gradient(to bottom, #65574E 50%, #D6D2CE 50%)',
								name: 'Vertical hard sable to beige',
							},
							{
								slug: 'gradient-10',
								gradient: 'linear-gradient(to bottom, #1A1514 50%, #D6D2CE 50%)',
								name: 'Vertical hard ebony to beige',
							},
							{
								slug: 'gradient-11',
								gradient: 'linear-gradient(to bottom, #65574E 50%, #958D86 50%)',
								name: 'Vertical hard sable to taupe',
							},
							{
								slug: 'gradient-12',
								gradient: 'linear-gradient(to bottom, #1A1514 50%, #65574E 50%)',
								name: 'Vertical hard ebony to sable',
							},
						],
					},
					palette: {
						theme: [
							{
								color: '#D6D2CE',
								name: 'Base',
								slug: 'base',
							},
							{
								color: '#E1DFDB',
								name: 'Base / Two',
								slug: 'base-2',
							},
							{
								color: '#1A1514',
								name: 'Contrast',
								slug: 'contrast',
							},
							{
								color: '#65574E',
								name: 'Contrast / Two',
								slug: 'contrast-2',
							},
							{
								color: '#958D86',
								name: 'Contrast / Three',
								slug: 'contrast-3',
							},
						],
					},
				},
			},
		},
		{
			slug: 'ice',
			title: 'Ice',
			settings: {
				color: {
					gradients: {
						theme: [
							{
								slug: 'gradient-1',
								gradient: 'linear-gradient(to bottom, #cbd9e1 0%, #EBEBEF 100%)',
								name: 'Vertical azure to ice',
							},
							{
								slug: 'gradient-2',
								gradient: 'linear-gradient(to bottom, #466577 0%, #EBEBEF 100%)',
								name: 'Vertical slate to ice',
							},
							{
								slug: 'gradient-3',
								gradient: 'linear-gradient(to bottom, #37505d 0%, #EBEBEF 100%)',
								name: 'Vertical ocean to ice',
							},
							{
								slug: 'gradient-4',
								gradient: 'linear-gradient(to bottom, #1C2930 0%, #EBEBEF 100%)',
								name: 'Vertical ink to ice',
							},
							{
								slug: 'gradient-5',
								gradient: 'linear-gradient(to bottom, #37505d 0%, #466577 100%)',
								name: 'Vertical ocean to slate',
							},
							{
								slug: 'gradient-6',
								gradient: 'linear-gradient(to bottom, #1C2930 0%, #37505d 100%)',
								name: 'Vertical ink to ocean',
							},
							{
								slug: 'gradient-7',
								gradient: 'linear-gradient(to bottom, #EBEBEF 50%, #cbd9e1 50%)',
								name: 'Vertical hard ice to azure',
							},
							{
								slug: 'gradient-8',
								gradient: 'linear-gradient(to bottom, #466577 50%, #EBEBEF 50%)',
								name: 'Vertical hard slate to ice',
							},
							{
								slug: 'gradient-9',
								gradient: 'linear-gradient(to bottom, #37505d 50%, #EBEBEF 50%)',
								name: 'Vertical hard ocean to ice',
							},
							{
								slug: 'gradient-10',
								gradient: 'linear-gradient(to bottom, #1C2930 50%, #EBEBEF 50%)',
								name: 'Vertical hard ink to ice',
							},
							{
								slug: 'gradient-11',
								gradient: 'linear-gradient(to bottom, #37505d 50%, #466577 50%)',
								name: 'Vertical hard ocean to slate',
							},
							{
								slug: 'gradient-12',
								gradient: 'linear-gradient(to bottom, #1C2930 50%, #37505d 50%)',
								name: 'Vertical hard ink to ocean',
							},
						],
					},
					palette: {
						theme: [
							{
								color: '#EBEBEF',
								name: 'Base',
								slug: 'base',
							},
							{
								color: '#DCE0E6',
								name: 'Base / Two',
								slug: 'base-2',
							},
							{
								color: '#1C2930',
								name: 'Contrast',
								slug: 'contrast',
							},
							{
								color: '#37505d',
								name: 'Contrast / Two',
								slug: 'contrast-2',
							},
							{
								color: '#96A5B2',
								name: 'Contrast / Three',
								slug: 'contrast-3',
							},
						],
					},
				},
			},
		},
		{
			slug: 'maelstrom',
			title: 'Maelstrom',
			settings: {
				color: {
					palette: {
						theme: [
							{
								color: '#38629F',
								name: 'Base',
								slug: 'base',
							},
							{
								color: '#244E8A',
								name: 'Base / Two',
								slug: 'base-2',
							},
							{
								color: '#FFFFFFA1',
								name: 'Contrast / 2',
								slug: 'contrast-2',
							},
							{
								color: '#FFFFFF',
								name: 'Contrast',
								slug: 'contrast',
							},
							{
								color: '#D5E0F0',
								name: 'Contrast / 3',
								slug: 'contrast-3',
							},
						],
					},
				},
			},
		},
		{
			slug: 'mint',
			title: 'Mint',
			settings: {
				color: {
					palette: {
						theme: [
							{
								color: '#e4efeb',
								name: 'Base',
								slug: 'base',
							},
							{
								color: '#f1fefb',
								name: 'Base / Two',
								slug: 'base-2',
							},
							{
								color: '#000000',
								name: 'Contrast',
								slug: 'contrast',
							},
							{
								color: '#353535',
								name: 'Contrast / Two',
								slug: 'contrast-2',
							},
							{
								color: '#A4A4A4',
								name: 'Contrast / Three',
								slug: 'contrast-3',
							},
						],
					},
				},
			},
		},
		{
			slug: 'onyx',
			title: 'Onyx',
			settings: {
				color: {
					duotone: {
						theme: [
							{
								colors: [ '#272727', '#f9f9f9' ],
								slug: 'duotone-1',
								name: 'Dark gray and white',
							},
							{
								colors: [ '#272727', '#5F584F' ],
								slug: 'duotone-2',
								name: 'Dark gray and walnut',
							},
							{
								colors: [ '#272727', '#973C20' ],
								slug: 'duotone-3',
								name: 'Dark gray and cinnamon',
							},
							{
								colors: [ '#272727', '#4D5B48' ],
								slug: 'duotone-4',
								name: 'Dark gray and olive',
							},
							{
								colors: [ '#272727', '#4F5959' ],
								slug: 'duotone-5',
								name: 'Dark gray and steel',
							},
						],
					},
					gradients: {
						theme: [
							{
								slug: 'gradient-1',
								gradient: 'linear-gradient(to bottom, #5F584F 0%, #272727 100%)',
								name: 'Vertical soft driftwood to dark gray',
							},
							{
								slug: 'gradient-2',
								gradient: 'linear-gradient(to bottom, #6D533C 0%, #272727 100%)',
								name: 'Vertical soft walnut to dark gray',
							},
							{
								slug: 'gradient-3',
								gradient: 'linear-gradient(to bottom, #973C20 0%, #272727 100%)',
								name: 'Vertical soft cinnamon to dark gray',
							},
							{
								slug: 'gradient-4',
								gradient: 'linear-gradient(to bottom, #4D5B48 0%, #272727 100%)',
								name: 'Vertical soft olive to dark gray',
							},
							{
								slug: 'gradient-5',
								gradient: 'linear-gradient(to bottom, #4F5959 0%, #272727 100%)',
								name: 'Vertical soft steel to dark gray',
							},
							{
								slug: 'gradient-6',
								gradient: 'linear-gradient(to bottom, #909090 0%, #272727 100%)',
								name: 'Vertical soft pewter to dark gray',
							},
							{
								slug: 'gradient-7',
								gradient: 'linear-gradient(to bottom, #5F584F 50%, #272727 50%)',
								name: 'Vertical hard beige to dark gray',
							},
							{
								slug: 'gradient-8',
								gradient: 'linear-gradient(to bottom, #6D533C 50%, #272727 50%)',
								name: 'Vertical hard walnut to dark gray',
							},
							{
								slug: 'gradient-9',
								gradient: 'linear-gradient(to bottom, #973C20 50%, #272727 50%)',
								name: 'Vertical hard cinnamon to dark gray',
							},
							{
								slug: 'gradient-10',
								gradient: 'linear-gradient(to bottom, #4D5B48 50%, #272727 50%)',
								name: 'Vertical hard olive to dark gray',
							},
							{
								slug: 'gradient-11',
								gradient: 'linear-gradient(to bottom, #4F5959 50%, #272727 50%)',
								name: 'Vertical hard steel to dark gray',
							},
							{
								slug: 'gradient-12',
								gradient: 'linear-gradient(to bottom, #A4A4A4 50%, #272727 50%)',
								name: 'Vertical hard pewter to dark gray',
							},
						],
					},
					palette: {
						theme: [
							{
								color: '#272727',
								name: 'Base',
								slug: 'base',
							},
							{
								color: '#303030',
								name: 'Base / Two',
								slug: 'base-2',
							},
							{
								color: '#f9f9f9',
								name: 'Contrast',
								slug: 'contrast',
							},
							{
								color: '#B7B7B7',
								name: 'Contrast / Two',
								slug: 'contrast-2',
							},
							{
								color: '#909090',
								name: 'Contrast / Three',
								slug: 'contrast-3',
							},
							{
								color: '#5F584F',
								name: 'Accent',
								slug: 'accent',
							},
							{
								color: '#6D533C',
								name: 'Accent / Two',
								slug: 'accent-2',
							},
							{
								color: '#973C20',
								name: 'Accent / Three',
								slug: 'accent-3',
							},
							{
								color: '#4D5B48',
								name: 'Accent / Four',
								slug: 'accent-4',
							},
							{
								color: '#4F5959',
								name: 'Accent / Five',
								slug: 'accent-5',
							},
						],
					},
				},
			},
		},
		{
			slug: 'rust',
			title: 'Rust',
			settings: {
				color: {
					duotone: {
						theme: [
							{
								colors: [ '#A62B0C', '#F3F0E7' ],
								slug: 'duotone-1',
								name: 'Dark rust to beige',
							},
						],
					},
					gradients: {
						theme: [
							{
								slug: 'gradient-1',
								gradient: 'linear-gradient(to bottom, #A62A0C42 0%, #F3F0E7 100%)',
								name: 'Vertical transparent rust to beige',
							},
							{
								slug: 'gradient-7',
								gradient: 'linear-gradient(to bottom, #A62A0C42 50%, #F3F0E7 50%)',
								name: 'Vertical hard transparent rust to beige',
							},
							{
								slug: 'gradient-2',
								gradient: 'linear-gradient(to bottom, #A62B0C 0%, #F3F0E7 100%)',
								name: 'Vertical rust to beige',
							},
							{
								slug: 'gradient-8',
								gradient: 'linear-gradient(to bottom, #A62B0C 50%, #F3F0E7 50%)',
								name: 'Vertical hard rust to beige',
							},
						],
					},
					palette: {
						theme: [
							{
								color: '#F3F0E7',
								name: 'Base',
								slug: 'base',
							},
							{
								color: '#ECEADF',
								name: 'Base / 2',
								slug: 'base-2',
							},
							{
								color: '#A62B0C',
								name: 'Contrast',
								slug: 'contrast',
							},
						],
					},
				},
			},
		},
	],
	is_virtual: false,
	theme: '',
	screenshot:
		'https://i0.wp.com/s2.wp.com/wp-content/themes/pub/twentytwentyfour/screenshot.png?ssl=1',
};
