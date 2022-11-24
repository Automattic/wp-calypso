import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import React from 'react';
import { CookieBanner } from '.';
import type { CookieBannerProps } from '.';

export default {
	title: 'Cookie Banner',
};

export const Default: Story< CookieBannerProps > = ( args ) => <CookieBanner { ...args } />;

Default.args = {
	onAccept: action( 'accept' ),
	content: {
		simpleConsent: {
			description: (
				<>
					Aliquam mollis malesuada vehicula. Curabitur porta pellentesque diam a posuere. Proin
					hendrerit a leo et aliquam. Suspendisse dictum pharetra tristique. Quisque hendrerit est
					dui, eget semper nulla vehicula ut. Sed posuere cursus urna consectetur condimentum.
					Pellentesque habitant morbi tristique.
				</>
			),
			acceptAllButton: 'Accept All',
			customizeButton: 'Customize',
		},
		customizedConsent: {
			description: (
				<>
					Quisque ornare facilisis lacus vitae aliquam. Nunc consequat sapien vel elit luctus, non
					venenatis dolor sodales. Donec <strong>consequat</strong> dignissim tortor sit amet
					pulvinar. Ut gravida consequat orci, in tempus ligula facilisis ac. Nulla augue urna,
					cursus quis sapien et, consectetur venenatis nulla. Nunc <strong>convallis</strong>{ ' ' }
					dapibus mi vel volutpat. Curabitur augue magna, <strong>lobortis</strong> eget diam ut,
					tempor gravida velit. Sed sit amet nisi at nunc facilisis fermentum in congue erat. Sed{ ' ' }
					<a href="https://automattic.com/" target="_blank" rel="noreferrer">
						interdum sed
					</a>{ ' ' }
					felis.
				</>
			),
			categories: {
				essential: {
					name: 'Required',
					description: (
						<>
							Aliquam auctor enim quis tortor malesuada volutpat. Etiam eget eros ut nisl maximus
							lacinia. Donec interdum nulla ut cursus tempor. Proin porta tempus elit non maximus.
							Duis eget urna at sem varius fermentum. Suspendisse accumsan imperdiet malesuada.
							Donec gravida nisl neque, vel eleifend ex pellentesque at. Etiam vulputate mi mauris,
							quis rutrum massa consequat nec.
						</>
					),
				},
				analytics: {
					name: 'Analytics',
					description: (
						<>
							Nunc lorem nulla, aliquet nec tortor et, pharetra maximus odio. Etiam quam felis,
							dignissim a neque ut, elementum laoreet massa. Integer interdum ornare velit et
							iaculis. Donec iaculis{ ' ' }
							<a href="https://automattic.com/" target="_blank" rel="noreferrer">
								ligula purus
							</a>
							, id blandit sem aliquam et. Fusce eget commodo est. Aliquam non eleifend libero. Ut
							laoreet sagittis nisi, ac gravida mi porta at. Nam ut eleifend.
						</>
					),
				},
				advertising: {
					name: 'Advertising',
					description: (
						<>
							Phasellus pretium volutpat lobortis. Duis et imperdiet mauris, at hendrerit arcu. Nunc
							placerat cursus vestibulum. Orci varius natoque penatibus et magnis dis parturient
							montes, nascetur ridiculus mus. Morbi aliquet risus at accumsan convallis. Vestibulum
							tincidunt iaculis ex vel cursus. Aliquam et nisi vitae odio porta faucibus eget non
							neque. Pellentesque eu scelerisque sem. Nam ut.
						</>
					),
				},
			},
			acceptSelectionButton: 'Accept Selection',
		},
	},
};
