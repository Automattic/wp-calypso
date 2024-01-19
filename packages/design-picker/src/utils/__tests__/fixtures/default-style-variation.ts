export const defaultStyleVariation = {
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
};
