/** @format */
/**
 * Internal dependencies
 */
import toggleState from '../toggle-state';

describe( 'toggleState.wpcom', () => {
	describe( 'when setting does not yet have a value', () => {
		test( 'should assign the value of `true` to that setting', () => {
			const settingToToggle = 'exampleSetting';
			const startingState = {
				settings: {},
			};

			const actual = toggleState.wpcom( startingState, null, null, settingToToggle );
			const expected = {
				settings: {
					dirty: {
						wpcom: {
							[ settingToToggle ]: true,
						},
					},
				},
			};

			expect( actual ).toEqual( expected );
		} );
	} );

	describe( 'when setting already has a value', () => {
		test( 'should toggle the value of that setting', () => {
			const settingToToggle = 'exampleSetting';
			const startingState = {
				settings: {
					dirty: {
						wpcom: {
							[ settingToToggle ]: true,
						},
					},
				},
			};

			const actual = toggleState.wpcom( startingState, null, null, settingToToggle );
			const expected = {
				settings: {
					dirty: {
						wpcom: {
							[ settingToToggle ]: false,
						},
					},
				},
			};

			expect( actual ).toEqual( expected );
		} );
	} );
} );

describe( 'toggleState.other', () => {
	describe( 'when `stream` is not a number', () => {
		describe( 'when setting does not yet have a value', () => {
			test( 'should toggle the value of that setting under that stream', () => {
				const stream = 'exampleStream';
				const settingToToggle = 'exampleSetting';
				const startingState = {
					settings: {},
				};

				const actual = toggleState.other( startingState, null, stream, settingToToggle );
				const expected = {
					settings: {
						dirty: {
							other: {
								[ stream ]: {
									[ settingToToggle ]: true,
								},
							},
						},
					},
				};

				expect( actual ).toEqual( expected );
			} );
		} );

		describe( 'when setting already has a value', () => {
			test( 'should toggle the value of that setting', () => {
				const stream = 'exampleStream';
				const settingToToggle = 'exampleSetting';
				const startingState = {
					settings: {
						dirty: {
							other: {
								[ stream ]: {
									[ settingToToggle ]: true,
								},
							},
						},
					},
				};

				const actual = toggleState.other( startingState, null, stream, settingToToggle );
				const expected = {
					settings: {
						dirty: {
							other: {
								[ stream ]: {
									[ settingToToggle ]: false,
								},
							},
						},
					},
				};

				expect( actual ).toEqual( expected );
			} );
		} );
	} );

	describe( 'when `stream` is a device ID (number)', () => {
		describe( 'when setting does not yet have a value', () => {
			test( 'should assign the value of `true` to that setting for the target device', () => {
				const deviceId = 123456;
				const settingToToggle = 'exampleSetting';
				const device = {
					device_id: deviceId,
				};
				const startingState = {
					settings: {
						dirty: {
							other: {
								devices: [ device ],
							},
						},
					},
				};

				const actual = toggleState.other( startingState, null, deviceId, settingToToggle );
				const expected = {
					settings: {
						dirty: {
							other: {
								devices: [
									{
										device_id: deviceId,
										[ settingToToggle ]: true,
									},
								],
							},
						},
					},
				};

				expect( actual ).toEqual( expected );
			} );
		} );

		describe( 'when setting already has a value', () => {
			test( 'should toggle the value of that setting for the target device', () => {
				const deviceId = 123456;
				const settingToToggle = 'exampleSetting';
				const device = {
					device_id: deviceId,
					[ settingToToggle ]: true,
				};
				const startingState = {
					settings: {
						dirty: {
							other: {
								devices: [ device ],
							},
						},
					},
				};

				const actual = toggleState.other( startingState, null, deviceId, settingToToggle );
				const expected = {
					settings: {
						dirty: {
							other: {
								devices: [
									{
										device_id: deviceId,
										[ settingToToggle ]: false,
									},
								],
							},
						},
					},
				};

				expect( actual ).toEqual( expected );
			} );
		} );
	} );
} );

describe( 'toggleState.blog', () => {
	describe( 'when `stream` is not a number', () => {
		describe( 'when setting does not yet have a value', () => {
			test( 'should toggle the value of that setting under that stream', () => {
				const blogId = 54321;
				const stream = 'exampleStream';
				const settingToToggle = 'exampleSetting';
				const blog = {
					blog_id: blogId,
				};
				const startingState = {
					settings: {
						dirty: {
							blogs: [ blog ],
						},
					},
				};

				const actual = toggleState.blog( startingState, blogId, stream, settingToToggle );
				const expected = {
					settings: {
						dirty: {
							blogs: [
								{
									blog_id: blogId,
									[ stream ]: {
										[ settingToToggle ]: true,
									},
								},
							],
						},
					},
				};

				expect( actual ).toEqual( expected );
			} );
		} );

		describe( 'when setting already has a value', () => {
			test( 'should toggle the value of that setting under that stream', () => {
				const blogId = 54321;
				const stream = 'exampleStream';
				const settingToToggle = 'exampleSetting';
				const blog = {
					blog_id: blogId,
					[ stream ]: {
						[ settingToToggle ]: true,
					},
				};
				const startingState = {
					settings: {
						dirty: {
							blogs: [ blog ],
						},
					},
				};

				const actual = toggleState.blog( startingState, blogId, stream, settingToToggle );
				const expected = {
					settings: {
						dirty: {
							blogs: [
								{
									blog_id: blogId,
									[ stream ]: {
										[ settingToToggle ]: false,
									},
								},
							],
						},
					},
				};

				expect( actual ).toEqual( expected );
			} );
		} );
	} );

	describe( 'when `stream` is a device ID (number)', () => {
		describe( 'when setting does not yet have a value', () => {
			test( 'should assign the value of `true` to that setting for the target device', () => {
				const deviceId = 123456;
				const blogId = 54321;
				const settingToToggle = 'exampleSetting';
				const device = {
					device_id: deviceId,
				};
				const blog = {
					blog_id: blogId,
					devices: [ device ],
				};
				const startingState = {
					settings: {
						dirty: {
							blogs: [ blog ],
						},
					},
				};

				const actual = toggleState.blog( startingState, blogId, deviceId, settingToToggle );
				const expected = {
					settings: {
						dirty: {
							blogs: [
								{
									blog_id: blogId,
									devices: [
										{
											device_id: deviceId,
											[ settingToToggle ]: true,
										},
									],
								},
							],
						},
					},
				};

				expect( actual ).toEqual( expected );
			} );
		} );

		describe( 'when setting already has a value', () => {
			test( 'should toggle the value of that setting for the target device', () => {
				const deviceId = 123456;
				const blogId = 54321;
				const settingToToggle = 'exampleSetting';
				const device = {
					device_id: deviceId,
					[ settingToToggle ]: true,
				};
				const blog = {
					blog_id: blogId,
					devices: [ device ],
				};
				const startingState = {
					settings: {
						dirty: {
							blogs: [ blog ],
						},
					},
				};

				const actual = toggleState.blog( startingState, blogId, deviceId, settingToToggle );
				const expected = {
					settings: {
						dirty: {
							blogs: [
								{
									blog_id: blogId,
									devices: [
										{
											device_id: deviceId,
											[ settingToToggle ]: false,
										},
									],
								},
							],
						},
					},
				};

				expect( actual ).toEqual( expected );
			} );
		} );
	} );
} );
