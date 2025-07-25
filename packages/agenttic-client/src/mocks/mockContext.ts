export const getClientContext = () => {
	return {
		selectedBlockClientId: 'qwu2',
		currentPageContent: [
			{
				name: 'core/post-content',
				type: 'content',
				clientId: 'kgrq',
				innerBlocks: [
					{
						clientId: 'hac1',
						name: 'core/group',
						isValid: true,
						originalContent:
							'<div class="wp-block-group alignfull is-style-section-default" id="intro-section" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40)"></div>',
						validationIssues: [],
						attributes: {
							tagName: 'div',
							metadata: {
								name: 'Introduction',
								patternCategory: 'intro',
								remotePatternId: 14040,
								reason: "Creates a strong first impression by highlighting Mama's Bread's reputation and inviting customers to discover more. Features key imagery. ",
							},
							align: 'full',
							className: 'is-style-section-default',
							style: {
								spacing: {
									margin: {
										top: '0',
										bottom: '0',
									},
									padding: {
										top: 'var:preset|spacing|40',
										bottom: 'var:preset|spacing|40',
									},
								},
							},
							layout: {
								type: 'constrained',
								justifyContent: 'center',
							},
							anchor: 'intro-section',
						},
						innerBlocks: [
							{
								clientId: 'XfP9',
								name: 'core/group',
								isValid: true,
								originalContent:
									'<div class="wp-block-group alignwide">\n\n</div>',
								validationIssues: [],
								attributes: {
									tagName: 'div',
									metadata: {
										name: 'Container',
									},
									align: 'wide',
									style: {
										spacing: {
											blockGap: 'var:preset|spacing|40',
										},
									},
									layout: {
										type: 'constrained',
									},
								},
								innerBlocks: [
									{
										clientId: 'bo18',
										name: 'core/columns',
										isValid: true,
										originalContent:
											'<div class="wp-block-columns alignwide are-vertically-aligned-top">\n\n</div>',
										validationIssues: [],
										attributes: {
											verticalAlignment: 'top',
											isStackedOnMobile: true,
											align: 'wide',
											style: {
												spacing: {
													blockGap: {
														top: 'var:preset|spacing|30',
													},
												},
											},
										},
										innerBlocks: [
											{
												clientId: 'B0cB',
												name: 'core/column',
												isValid: true,
												originalContent:
													'<div class="wp-block-column is-vertically-aligned-top"></div>',
												validationIssues: [],
												attributes: {
													verticalAlignment: 'top',
													width: '',
													layout: {
														type: 'constrained',
														justifyContent: 'left',
														contentSize: '480px',
													},
												},
												innerBlocks: [
													{
														clientId: '2Vj9',
														name: 'core/heading',
														isValid: true,
														originalContent:
															'<h2 class="wp-block-heading">Welcome to Oakland\'s Favorite Bakery</h2>',
														validationIssues: [],
														attributes: {
															content:
																"Welcome to Oakland's Favorite Bakery",
															level: 2,
														},
														innerBlocks: [],
													},
												],
											},
											{
												clientId: 'KHCI',
												name: 'core/column',
												isValid: true,
												originalContent:
													'<div class="wp-block-column is-vertically-aligned-top" style="flex-basis:40%">\n\n</div>',
												validationIssues: [],
												attributes: {
													verticalAlignment: 'top',
													width: '40%',
												},
												innerBlocks: [
													{
														clientId: 'qwu2',
														name: 'core/paragraph',
														isValid: true,
														originalContent:
															"<p>Discover why Mama's Bread is celebrated for its fresh, artisanal bread crafted with passion and tradition. Join us and taste the difference.</p>",
														validationIssues: [],
														attributes: {
															content:
																"Discover why Mama's Bread is celebrated for its fresh, artisanal bread crafted with passion and tradition. Join us and taste the difference.",
															dropCap: false,
														},
														innerBlocks: [],
													},
													{
														clientId: 'o-IA',
														name: 'core/buttons',
														isValid: true,
														originalContent:
															'<div class="wp-block-buttons"></div>',
														validationIssues: [],
														attributes: {},
														innerBlocks: [
															{
																clientId:
																	'wsbN',
																name: 'core/button',
																isValid: true,
																originalContent:
																	'<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="menu">Menu</a></div>',
																validationIssues:
																	[],
																attributes: {
																	tagName:
																		'a',
																	type: 'button',
																	url: 'menu',
																	text: 'Menu',
																},
																innerBlocks: [],
															},
														],
													},
												],
											},
										],
									},
									{
										clientId: 'K9PG',
										name: 'core/image',
										isValid: true,
										originalContent:
											'<figure class="wp-block-image alignwide size-full aspect-16/9"><img src="http://localhost:8888/wp-content/uploads/2025/05/image-pexels-1055271.jpg" alt="bakery" class="wp-image-145"/></figure>',
										validationIssues: [],
										attributes: {
											url: 'http://localhost:8888/wp-content/uploads/2025/05/image-pexels-1055271.jpg',
											alt: 'bakery',
											caption: '',
											id: 145,
											sizeSlug: 'full',
											linkDestination: 'none',
											align: 'wide',
											className: 'aspect-16/9',
										},
										innerBlocks: [],
									},
								],
							},
						],
					},
				],
			},
		],
	};
};
